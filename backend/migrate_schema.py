#!/usr/bin/env python3
"""
Migration script to add missing columns to the todos table.
"""
import os
import sys
from sqlalchemy import text

# Add src to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(backend_dir, "src")
sys.path.insert(0, src_dir)

from app.database import engine
from app.config import settings

def migrate():
    print(f"Checking schema for database: {settings.DATABASE_URL}")
    
    with engine.connect() as conn:
        # Check for missing columns
        existing_columns = []
        if settings.DATABASE_URL.startswith("postgresql"):
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'todos'
            """))
            existing_columns = [row[0] for row in result]
        else:
            # SQLite fallback
            result = conn.execute(text("PRAGMA table_info(todos)"))
            existing_columns = [row[1] for row in result]
            
        print(f"Existing columns: {existing_columns}")
        
        # Add missing columns
        columns_to_add = {
            "priority": "ALTER TABLE todos ADD COLUMN priority VARCHAR DEFAULT 'Medium' NOT NULL",
            "due_date": "ALTER TABLE todos ADD COLUMN due_date TIMESTAMP",
            "category": "ALTER TABLE todos ADD COLUMN category VARCHAR"
        }
        
        for col, sql in columns_to_add.items():
            if col not in existing_columns:
                print(f"Adding column '{col}'...")
                conn.execute(text(sql))
                conn.commit()
                print(f"Column '{col}' added successfully.")
            else:
                print(f"Column '{col}' already exists.")

    print("Migration completed.")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)
