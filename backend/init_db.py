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


if __name__ == "__main__":
    migrate_flag = "--migrate-from-sqlite" in sys.argv

    print("Initializing database using configured DATABASE_URL...")
    print(f"  DB_BACKEND = {getattr(settings, 'DB_BACKEND', 'unknown')}")
    print(f"  DATABASE_URL = {settings.DATABASE_URL}")

    # Create tables in the configured backend (SQLite or PostgreSQL)
    init_db()

    if migrate_flag:
        if getattr(settings, "DB_BACKEND", "sqlite") != "postgresql":
            print("Skipping migration: DB_BACKEND is not 'postgresql'. "
                  "Set DB_BACKEND=postgresql and DATABASE_URL to your Postgres DB before migrating.")
        else:
            migrate_from_sqlite()

    print("Done.")
