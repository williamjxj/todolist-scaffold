"""
Integration tests for end-to-end migration process.

These tests verify the complete migration flow from local PostgreSQL to Supabase.
Note: These tests require actual database connections and may be skipped if not configured.
"""
import os
import sys
import pytest

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.config import settings  # noqa: E402
from app.models import TodoItem  # noqa: E402


@pytest.mark.integration
def test_migration_script_structure():
    """
    Test that migration script has required functions.
    
    This is a structural test that doesn't require database connections.
    """
    import backend.migrate_to_supabase as migration  # noqa: E402
    
    # Check required functions exist
    assert hasattr(migration, 'read_todos_from_local_postgres')
    assert hasattr(migration, 'write_todos_to_supabase')
    assert hasattr(migration, 'validate_migration')
    assert hasattr(migration, 'main')
    
    # Check functions are callable
    assert callable(migration.read_todos_from_local_postgres)
    assert callable(migration.write_todos_to_supabase)
    assert callable(migration.validate_migration)
    assert callable(migration.main)


@pytest.mark.integration
def test_get_local_postgres_url_from_env():
    """Test that get_local_postgres_url reads from environment"""
    from backend.migrate_to_supabase import get_local_postgres_url  # noqa: E402
    
    # Test with environment variable set
    test_url = "postgresql://test:test@localhost:5432/testdb"
    os.environ["LOCAL_POSTGRES_URL"] = test_url
    
    try:
        result = get_local_postgres_url()
        assert result == test_url
    finally:
        os.environ.pop("LOCAL_POSTGRES_URL", None)


@pytest.mark.integration
def test_get_supabase_url_from_settings():
    """Test that get_supabase_url reads from settings"""
    from backend.migrate_to_supabase import get_supabase_url  # noqa: E402
    
    # Test with Supabase URL in settings
    if settings.DATABASE_URL and "supabase" in settings.DATABASE_URL.lower():
        result = get_supabase_url()
        assert result is not None
        assert "supabase" in result.lower()
    else:
        pytest.skip("Supabase URL not configured in settings")


@pytest.mark.integration
@pytest.mark.skip(reason="Requires actual database connections - run manually")
def test_end_to_end_migration():
    """
    End-to-end migration test.
    
    This test requires:
    - Local PostgreSQL database with todos
    - Supabase database configured
    - LOCAL_POSTGRES_URL environment variable set
    
    To run this test manually:
    1. Set LOCAL_POSTGRES_URL environment variable
    2. Configure Supabase DATABASE_URL in backend/.env
    3. Remove @pytest.mark.skip decorator
    4. Run: pytest backend/tests/integration/test_migration_supabase.py::test_end_to_end_migration -v
    """
    from backend.migrate_to_supabase import (  # noqa: E402
        read_todos_from_local_postgres,
        write_todos_to_supabase,
        validate_migration
    )
    
    local_url = os.environ.get("LOCAL_POSTGRES_URL")
    supabase_url = settings.DATABASE_URL
    
    if not local_url or not supabase_url:
        pytest.skip("Database URLs not configured")
    
    # Read from local
    todos = read_todos_from_local_postgres(local_url)
    assert len(todos) > 0, "No todos found in local PostgreSQL"
    
    # Write to Supabase
    written_count = write_todos_to_supabase(todos, supabase_url)
    assert written_count == len(todos), "Not all todos were written"
    
    # Validate
    is_valid = validate_migration(local_url, supabase_url)
    assert is_valid, "Migration validation failed"

