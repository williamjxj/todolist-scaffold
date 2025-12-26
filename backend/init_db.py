#!/usr/bin/env python3
"""
Database initialization and migration script.

Usage examples (run from backend/ directory):
  - Initialize DB in the currently configured backend (SQLite or PostgreSQL):
        python init_db.py
  - Initialize DB and migrate existing data from SQLite todos.db to PostgreSQL:
        python init_db.py --migrate-from-sqlite
"""
import os
import sys
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(backend_dir, "src")
sys.path.insert(0, src_dir)

# Import application modules after sys.path adjustment
from app.config import settings  # type: ignore  # noqa: E402
from app.database import Base, SessionLocal, init_db  # type: ignore  # noqa: E402
from app.models import TodoItem  # type: ignore  # noqa: E402


def migrate_from_sqlite(sqlite_url: Optional[str] = None) -> None:
    """
    Migrate existing todos from a SQLite database into the currently
    configured database (typically PostgreSQL for this feature).

    - Reads from the SQLite file using the same SQLAlchemy models.
    - Writes rows into the configured backend using SessionLocal.
    """
    if sqlite_url is None:
        # Default location used by the existing app (todos.db in src/)
        sqlite_url = "sqlite:///./todos.db"

    if not sqlite_url.startswith("sqlite"):
        print(f"Skipping migration: provided URL is not SQLite: {sqlite_url}")
        return

    print(f"Starting migration from SQLite database at: {sqlite_url}")

    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    SqliteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

    sqlite_session = SqliteSessionLocal()
    target_session = SessionLocal()

    try:
        # Ensure source tables exist
        Base.metadata.create_all(bind=sqlite_engine)

        todos = sqlite_session.query(TodoItem).all()
        print(f"Found {len(todos)} todos in SQLite database.")

        for todo in todos:
            # Recreate TodoItem with the same primary key and fields.
            clone = TodoItem(
                id=todo.id,
                description=todo.description,
                completed=todo.completed,
                created_at=todo.created_at,
                updated_at=todo.updated_at,
            )
            # merge() will upsert based on primary key
            target_session.merge(clone)

        target_session.commit()
        print(f"Migrated {len(todos)} todos into configured database.")

    finally:
        sqlite_session.close()
        target_session.close()


def check_existing_tables():
    """
    Check for existing tables in the database to avoid accidental modifications.
    
    Returns:
        set: Set of existing table names
    """
    from sqlalchemy import inspect
    from app.database import engine
    
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    return existing_tables


def create_todos_table_safely():
    """
    Create the todos table in Supabase with safeguards to avoid modifying existing tables.
    
    This function:
    1. Checks for existing tables (patients, migration_checkpoints, alembic_version)
    2. Only creates the todos table if it doesn't exist
    3. Does not modify any existing tables
    """
    from sqlalchemy import inspect, text
    from app.database import engine, Base
    from app.models import TodoItem
    
    # Get list of existing tables
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    
    # Tables that should NOT be modified
    protected_tables = {"patients", "migration_checkpoints", "alembic_version"}
    
    # Check if any protected tables exist
    existing_protected = existing_tables & protected_tables
    if existing_protected:
        print(f"Found existing tables in database: {sorted(existing_protected)}")
        print("These tables will NOT be modified.")
    
    # Check if todos table already exists
    if "todos" in existing_tables:
        print("Table 'todos' already exists. Skipping table creation.")
        return
    
    # Create only the todos table
    print("Creating 'todos' table...")
    TodoItem.__table__.create(bind=engine, checkfirst=True)
    print("Table 'todos' created successfully.")


if __name__ == "__main__":
    migrate_flag = "--migrate-from-sqlite" in sys.argv

    print("Initializing database using configured DATABASE_URL...")
    print(f"  DB_BACKEND = {getattr(settings, 'DB_BACKEND', 'unknown')}")
    print(f"  DATABASE_URL = {settings.DATABASE_URL}")
    
    # Check if using Supabase
    is_supabase = settings.DATABASE_URL and "supabase" in settings.DATABASE_URL.lower()
    
    if is_supabase:
        # For Supabase, use safe table creation to avoid modifying existing tables
        print("Detected Supabase database. Using safe table creation...")
        create_todos_table_safely()
    else:
        # For other databases, use standard initialization
        # Create tables in the configured backend (SQLite or PostgreSQL)
        init_db()

    if migrate_flag:
        if getattr(settings, "DB_BACKEND", "sqlite") != "postgresql":
            print("Skipping migration: DB_BACKEND is not 'postgresql'. "
                  "Set DB_BACKEND=postgresql and DATABASE_URL to your Postgres DB before migrating.")
        else:
            migrate_from_sqlite()

    print("Done.")
