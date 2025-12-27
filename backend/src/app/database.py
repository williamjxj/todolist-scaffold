import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.config import settings

logger = logging.getLogger(__name__)


def _create_engine_from_settings():
    """
    Create async SQLAlchemy engine based on current settings.

    - Uses DATABASE_URL for the connection string.
    - Converts postgresql:// to postgresql+asyncpg:// for async support.
    - Handles Supabase and Render PostgreSQL connections with SSL requirements.
    - Resolves 'sslmode' incompatibility with asyncpg by moving it to connect_args.
    """
    url = settings.DATABASE_URL
    connect_args = {}
    
    # Convert to async driver URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql+psycopg://"):
        url = url.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)
    
    # For SQLite, use aiosqlite
    if url.startswith("sqlite"):
        if not url.startswith("sqlite+aiosqlite"):
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    
    # Handle SSL and PgBouncer configuration for asyncpg
    if "asyncpg" in url:
        import re
        from urllib.parse import urlparse, parse_qs, urlunparse, urlencode

        # Parse the URL to handle parameters robustly
        parsed_url = urlparse(url)
        params = parse_qs(parsed_url.query)
        
        # Handle sslmode
        ssl_mode = params.get("sslmode", [None])[0]
        if ssl_mode:
            if ssl_mode in ("require", "prefer", "allow", "verify-ca", "verify-full"):
                import ssl
                ctx = ssl.create_default_context()
                if ssl_mode in ("require", "prefer", "allow"):
                    ctx.check_hostname = False
                    ctx.verify_mode = ssl.CERT_NONE
                connect_args["ssl"] = ctx
                logger.info(f"Configuring asyncpg with SSL (sslmode={ssl_mode}, verification={'disabled' if ssl_mode in ('require', 'prefer', 'allow') else 'enabled'})")

        # Strip incompatible parameters from the URL
        # asyncpg doesn't support many standard libpq parameters in the connection string
        incompatible_params = ["sslmode", "target_session_attrs", "pool_timeout"]
        new_params = {k: v for k, v in params.items() if k not in incompatible_params}
        
        # Reconstruct URL without incompatible parameters
        new_query = urlencode(new_params, doseq=True)
        url = urlunparse(parsed_url._replace(query=new_query))

        # Supabase and other poolers (PgBouncer) compatibility
        if "supabase" in url.lower() or "pooler" in url.lower():
            connect_args["statement_cache_size"] = 0
            logger.info("Disabling asyncpg statement cache for PgBouncer compatibility (detected Supabase/pooler)")
        elif "render" in url.lower() and "ssl" not in connect_args:
            # Fallback for Render if sslmode wasn't specified
            import ssl
            connect_args["ssl"] = ssl.create_default_context()
            logger.info("Enabling default SSL for Render PostgreSQL connection")

    # Final URL sanitization for logging (hide password)
    sanitized_url = re.sub(r':([^@]+)@', ':****@', url)
    logger.debug(f"Connecting to database: {sanitized_url}")
    
    return create_async_engine(
        url, 
        connect_args=connect_args, 
        echo=False, 
        future=True
    )


# Create async database engine
engine = _create_engine_from_settings()

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()


async def get_db():
    """
    Async dependency function to get database session.
    FastAPI will call this for each request that needs database access.
    
    Handles connection errors gracefully and provides clear error messages.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logger.error(f"Database error during request: {e}")
            await session.rollback()
            raise
        except Exception as e:
            logger.error(f"Unexpected error during database operation: {e}")
            await session.rollback()
            raise


async def verify_connection():
    """
    Verify database connection and log connection status.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    import time
    start_time = time.time()
    
    try:
        async with engine.begin() as conn:
            # Simple query to verify connection
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
            connection_time = time.time() - start_time
            
            logger.info(f"Database connection verified successfully (took {connection_time:.3f}s)")
            
            # Log connection details (without sensitive info)
            db_url = settings.DATABASE_URL
            if db_url.startswith("postgresql"):
                if "supabase" in db_url.lower():
                    logger.info("Connected to Supabase cloud database")
                    # Log connection time for performance monitoring
                    if connection_time > 5.0:
                        logger.warning(f"Supabase connection took {connection_time:.3f}s (target: < 5s)")
                else:
                    logger.info("Connected to PostgreSQL database")
            elif db_url.startswith("sqlite"):
                logger.info("Connected to SQLite database")
            
            return True
    except SQLAlchemyError as e:
        connection_time = time.time() - start_time
        logger.error(f"Database connection failed after {connection_time:.3f}s: {e}")
        logger.error("Please check your DATABASE_URL configuration and network connectivity")
        return False
    except Exception as e:
        connection_time = time.time() - start_time
        logger.error(f"Unexpected error during connection verification (after {connection_time:.3f}s): {e}")
        return False


async def init_db():
    """Initialize database - create all tables"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully! Tables created in configured database.")
        
        # Verify connection after initialization
        if not await verify_connection():
            logger.warning("Database initialization completed but connection verification failed")
    except SQLAlchemyError as e:
        logger.error(f"Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
