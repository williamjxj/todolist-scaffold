import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from app.config import settings

logger = logging.getLogger(__name__)


def _create_engine_from_settings():
    """
    Create SQLAlchemy engine based on current settings.

    - Uses DATABASE_URL for the connection string.
    - Applies SQLite-specific connect_args only when using SQLite.
    - Handles Supabase PostgreSQL connections with SSL requirements.
    """
    url = settings.DATABASE_URL
    connect_args = {}

    # SQLite requires a special check_same_thread flag when used in FastAPI
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    # Supabase and other PostgreSQL connections require SSL
    elif url.startswith("postgresql") and "supabase" in url.lower():
        # Ensure SSL is required for Supabase connections
        if "sslmode" not in url:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}sslmode=require"
        logger.info("Configuring Supabase PostgreSQL connection with SSL")

    return create_engine(url, connect_args=connect_args)


# Create database engine
engine = _create_engine_from_settings()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    FastAPI will call this for each request that needs database access.
    
    Handles connection errors gracefully and provides clear error messages.
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error during request: {e}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database operation: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_connection():
    """
    Verify database connection and log connection status.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    import time
    start_time = time.time()
    
    try:
        with engine.connect() as conn:
            # Simple query to verify connection
            result = conn.execute(text("SELECT 1"))
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


def init_db():
    """Initialize database - create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully! Tables created in configured database.")
        
        # Verify connection after initialization
        if not verify_connection():
            logger.warning("Database initialization completed but connection verification failed")
    except SQLAlchemyError as e:
        logger.error(f"Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    init_db()
