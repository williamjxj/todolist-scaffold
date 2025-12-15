from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings


def _create_engine_from_settings():
    """
    Create SQLAlchemy engine based on current settings.

    - Uses DATABASE_URL for the connection string.
    - Applies SQLite-specific connect_args only when using SQLite.
    """
    url = settings.DATABASE_URL
    connect_args = {}

    # SQLite requires a special check_same_thread flag when used in FastAPI
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

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
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully! Tables created in configured database.")


if __name__ == "__main__":
    init_db()
