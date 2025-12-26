"""
Integration tests for Supabase database connection.

These tests verify that the application can connect to Supabase
and perform basic database operations.
"""
import os
import pytest
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

# Add src to path
import sys
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.database import engine, verify_connection  # noqa: E402
from app.config import settings  # noqa: E402


@pytest.mark.integration
def test_supabase_connection_verification():
    """
    Test that verify_connection() works with Supabase.
    
    This test requires SUPABASE_URL to be set in environment or .env file.
    If not configured, the test will be skipped.
    """
    # Skip if not using Supabase
    if not settings.DATABASE_URL or "supabase" not in settings.DATABASE_URL.lower():
        pytest.skip("Supabase connection not configured. Set DATABASE_URL with Supabase connection string.")
    
    # Test connection verification
    result = verify_connection()
    assert result is True, "Failed to verify Supabase connection"


@pytest.mark.integration
def test_supabase_basic_query():
    """
    Test that we can execute a basic query against Supabase.
    
    This test requires Supabase connection to be configured.
    """
    # Skip if not using Supabase
    if not settings.DATABASE_URL or "supabase" not in settings.DATABASE_URL.lower():
        pytest.skip("Supabase connection not configured. Set DATABASE_URL with Supabase connection string.")
    
    try:
        with engine.connect() as conn:
            # Simple query to test connection
            result = conn.execute(text("SELECT 1 as test_value"))
            row = result.fetchone()
            assert row is not None
            assert row[0] == 1
    except SQLAlchemyError as e:
        pytest.fail(f"Failed to execute query against Supabase: {e}")


@pytest.mark.integration
def test_supabase_ssl_connection():
    """
    Test that Supabase connection uses SSL (sslmode=require).
    
    This test verifies that the connection string includes SSL requirements.
    """
    # Skip if not using Supabase
    if not settings.DATABASE_URL or "supabase" not in settings.DATABASE_URL.lower():
        pytest.skip("Supabase connection not configured. Set DATABASE_URL with Supabase connection string.")
    
    # Verify connection string includes SSL
    assert "sslmode=require" in settings.DATABASE_URL or "sslmode=require" in str(engine.url), \
        "Supabase connection should require SSL (sslmode=require)"

