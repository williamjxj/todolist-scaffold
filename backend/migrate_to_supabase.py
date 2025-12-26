#!/usr/bin/env python3
"""
Migration script to transfer todos from local PostgreSQL to Supabase.

This script:
1. Reads all todos from local PostgreSQL database
2. Writes them to Supabase database
3. Validates data integrity (record counts, field matching)
4. Provides progress logging and error handling

Usage:
    python3 migrate_to_supabase.py

Prerequisites:
    - Local PostgreSQL database with todos table
    - Supabase database configured in DATABASE_URL
    - Both databases accessible from this machine
"""
import os
import sys
from typing import Optional
from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

# Add src to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(backend_dir, "src")
sys.path.insert(0, src_dir)

from app.config import settings  # type: ignore  # noqa: E402
from app.models import TodoItem  # type: ignore  # noqa: E402


def get_local_postgres_url() -> Optional[str]:
    """
    Get local PostgreSQL connection URL from environment or prompt user.
    
    Returns:
        Optional[str]: PostgreSQL connection URL or None if not available
    """
    # Try to get from environment variable
    local_url = os.environ.get("LOCAL_POSTGRES_URL")
    
    if local_url:
        return local_url
    
    # If not in environment, prompt user or use a default pattern
    # For this script, we'll require it to be set
    print("ERROR: LOCAL_POSTGRES_URL environment variable not set.")
    print("Please set it to your local PostgreSQL connection string, e.g.:")
    print("  export LOCAL_POSTGRES_URL='postgresql+psycopg://user:password@localhost:5432/database'")
    return None


def get_supabase_url() -> Optional[str]:
    """
    Get Supabase connection URL from settings.
    
    Returns:
        Optional[str]: Supabase connection URL or None if not configured
    """
    url = settings.DATABASE_URL
    
    if not url:
        print("ERROR: DATABASE_URL not configured in backend/.env")
        return None
    
    if "supabase" not in url.lower():
        print("WARNING: DATABASE_URL does not appear to be a Supabase connection.")
        print(f"Current DATABASE_URL: {url[:50]}...")
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != "yes":
            return None
    
    return url


def read_todos_from_local_postgres(local_url: str) -> list[TodoItem]:
    """
    Read all todos from local PostgreSQL database.
    
    Args:
        local_url: Local PostgreSQL connection string
        
    Returns:
        list[TodoItem]: List of todos from local database
        
    Raises:
        SQLAlchemyError: If connection or query fails
    """
    print(f"Connecting to local PostgreSQL: {local_url.split('@')[1] if '@' in local_url else 'local'}")
    
    local_engine = create_engine(local_url)
    LocalSession = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)
    session = LocalSession()
    
    try:
        todos = session.query(TodoItem).order_by(TodoItem.id).all()
        print(f"Found {len(todos)} todos in local PostgreSQL database.")
        return todos
    finally:
        session.close()
        local_engine.dispose()


def write_todos_to_supabase(todos: list[TodoItem], supabase_url: str) -> int:
    """
    Write todos to Supabase database.
    
    Args:
        todos: List of todos to migrate
        supabase_url: Supabase connection string
        
    Returns:
        int: Number of todos successfully written
        
    Raises:
        SQLAlchemyError: If connection or write fails
    """
    print(f"Connecting to Supabase...")
    
    # Ensure SSL is required for Supabase
    if "sslmode" not in supabase_url:
        separator = "&" if "?" in supabase_url else "?"
        supabase_url = f"{supabase_url}{separator}sslmode=require"
    
    supabase_engine = create_engine(supabase_url)
    SupabaseSession = sessionmaker(autocommit=False, autoflush=False, bind=supabase_engine)
    session = SupabaseSession()
    
    try:
        written_count = 0
        for i, todo in enumerate(todos, 1):
            try:
                # Create new TodoItem with same data
                new_todo = TodoItem(
                    id=todo.id,
                    description=todo.description,
                    completed=todo.completed,
                    priority=todo.priority,
                    due_date=todo.due_date,
                    category=todo.category,
                    created_at=todo.created_at,
                    updated_at=todo.updated_at
                )
                # Use merge to handle existing records (upsert)
                session.merge(new_todo)
                written_count += 1
                
                if i % 100 == 0:
                    print(f"  Migrated {i}/{len(todos)} todos...")
                    
            except Exception as e:
                print(f"  ERROR migrating todo ID {todo.id}: {e}")
                session.rollback()
                continue
        
        session.commit()
        print(f"Successfully wrote {written_count} todos to Supabase.")
        return written_count
        
    except SQLAlchemyError as e:
        session.rollback()
        print(f"ERROR writing to Supabase: {e}")
        raise
    finally:
        session.close()
        supabase_engine.dispose()


def validate_migration(local_url: str, supabase_url: str) -> bool:
    """
    Validate that migration was successful by comparing record counts and sample data.
    
    Args:
        local_url: Local PostgreSQL connection string
        supabase_url: Supabase connection string
        
    Returns:
        bool: True if validation passes, False otherwise
    """
    print("\nValidating migration...")
    
    # Get counts from both databases
    local_engine = create_engine(local_url)
    local_session = sessionmaker(bind=local_engine)()
    
    # Ensure SSL for Supabase
    if "sslmode" not in supabase_url:
        separator = "&" if "?" in supabase_url else "?"
        supabase_url = f"{supabase_url}{separator}sslmode=require"
    
    supabase_engine = create_engine(supabase_url)
    supabase_session = sessionmaker(bind=supabase_engine)()
    
    try:
        # Count records
        local_count = local_session.query(TodoItem).count()
        supabase_count = supabase_session.query(TodoItem).count()
        
        print(f"  Local PostgreSQL: {local_count} todos")
        print(f"  Supabase: {supabase_count} todos")
        
        if local_count != supabase_count:
            print(f"  ✗ VALIDATION FAILED: Record counts don't match!")
            return False
        
        print(f"  ✓ Record counts match: {local_count}")
        
        # Sample a few records for field-level validation
        if local_count > 0:
            local_todos = local_session.query(TodoItem).limit(5).all()
            for local_todo in local_todos:
                supabase_todo = supabase_session.query(TodoItem).filter(
                    TodoItem.id == local_todo.id
                ).first()
                
                if not supabase_todo:
                    print(f"  ✗ VALIDATION FAILED: Todo ID {local_todo.id} not found in Supabase!")
                    return False
                
                # Check key fields
                if (supabase_todo.description != local_todo.description or
                    supabase_todo.completed != local_todo.completed or
                    supabase_todo.priority != local_todo.priority):
                    print(f"  ✗ VALIDATION FAILED: Todo ID {local_todo.id} fields don't match!")
                    return False
            
            print(f"  ✓ Field-level validation passed (checked {min(5, local_count)} sample records)")
        
        print("  ✓ Migration validation PASSED")
        return True
        
    except SQLAlchemyError as e:
        print(f"  ✗ VALIDATION ERROR: {e}")
        return False
    finally:
        local_session.close()
        local_engine.dispose()
        supabase_session.close()
        supabase_engine.dispose()


def main():
    """Main migration function"""
    print("=" * 60)
    print("Migration: Local PostgreSQL → Supabase")
    print("=" * 60)
    print()
    
    # Get connection URLs
    local_url = get_local_postgres_url()
    if not local_url:
        sys.exit(1)
    
    supabase_url = get_supabase_url()
    if not supabase_url:
        sys.exit(1)
    
    print(f"Source: Local PostgreSQL")
    print(f"Target: Supabase")
    print()
    
    # Confirm before proceeding
    print("WARNING: This will migrate todos from local PostgreSQL to Supabase.")
    print("Make sure:")
    print("  1. Application is stopped or in read-only mode")
    print("  2. You have a backup of your local PostgreSQL database")
    print("  3. Supabase database is accessible")
    print()
    response = input("Proceed with migration? (yes/no): ")
    if response.lower() != "yes":
        print("Migration cancelled.")
        sys.exit(0)
    
    print()
    print("Starting migration...")
    print("-" * 60)
    
    try:
        # Step 1: Read from local PostgreSQL
        todos = read_todos_from_local_postgres(local_url)
        
        if len(todos) == 0:
            print("No todos to migrate. Exiting.")
            return
        
        # Step 2: Write to Supabase
        written_count = write_todos_to_supabase(todos, supabase_url)
        
        # Step 3: Validate
        if validate_migration(local_url, supabase_url):
            print()
            print("=" * 60)
            print("✓ Migration completed successfully!")
            print(f"  Migrated {written_count} todos from local PostgreSQL to Supabase")
            print("=" * 60)
            print()
            print("Next steps:")
            print("  1. Update backend/.env to use Supabase DATABASE_URL permanently")
            print("  2. Restart the application")
            print("  3. Verify all operations work correctly")
            print("  4. Keep local PostgreSQL as backup until migration is verified")
        else:
            print()
            print("=" * 60)
            print("✗ Migration completed but validation failed!")
            print("  Please review the errors above and fix any issues.")
            print("  You may need to:")
            print("    - Clear the todos table in Supabase and retry")
            print("    - Check for data inconsistencies")
            print("    - Review connection settings")
            print("=" * 60)
            sys.exit(1)
            
    except SQLAlchemyError as e:
        print()
        print("=" * 60)
        print("✗ Migration failed with database error:")
        print(f"  {e}")
        print("=" * 60)
        print()
        print("Rollback guidance:")
        print("  - Local PostgreSQL database is unchanged")
        print("  - Supabase may have partial data - review and clear if needed")
        print("  - Check connection strings and network connectivity")
        print("  - Verify Supabase database is accessible")
        sys.exit(1)
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ Migration failed with unexpected error:")
        print(f"  {e}")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()

