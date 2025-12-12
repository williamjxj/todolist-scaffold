#!/usr/bin/env python3
"""
Database initialization script.
Run with: python init_db.py
"""
import sys
import os

# Add src to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(backend_dir, 'src')
sys.path.insert(0, src_dir)

# Change to src directory so database is created in the right location
# (backend expects it in src/ when running from src/)
os.chdir(src_dir)

# Import models so SQLAlchemy knows what tables to create
from app import models  # noqa: F401
from app.database import init_db

if __name__ == "__main__":
    print("Initializing database...")
    print(f"Creating database in: {os.path.join(os.getcwd(), 'todos.db')}")
    init_db()
    print("Done! Database file created: todos.db")
