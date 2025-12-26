"""
Unit tests for migration script data reading logic.

These tests verify that the migration script can correctly
read todos from a source database.
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.models import TodoItem  # noqa: E402


@pytest.mark.unit
def test_read_todos_from_local_postgres_success():
    """Test successful reading of todos from local PostgreSQL"""
    from backend.migrate_to_supabase import read_todos_from_local_postgres  # noqa: E402
    
    # Mock database session and query
    mock_todos = [
        MagicMock(spec=TodoItem, id=1, description="Test 1", completed=False),
        MagicMock(spec=TodoItem, id=2, description="Test 2", completed=True),
    ]
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_session.query.return_value.order_by.return_value.all.return_value = mock_todos
        mock_sessionmaker.return_value.return_value = mock_session
        
        result = read_todos_from_local_postgres("postgresql://test")
        
        assert len(result) == 2
        assert result[0].id == 1
        assert result[1].id == 2


@pytest.mark.unit
def test_read_todos_from_local_postgres_empty():
    """Test reading from empty database"""
    from backend.migrate_to_supabase import read_todos_from_local_postgres  # noqa: E402
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_session.query.return_value.order_by.return_value.all.return_value = []
        mock_sessionmaker.return_value.return_value = mock_session
        
        result = read_todos_from_local_postgres("postgresql://test")
        
        assert len(result) == 0


@pytest.mark.unit
def test_read_todos_from_local_postgres_error():
    """Test error handling when reading fails"""
    from backend.migrate_to_supabase import read_todos_from_local_postgres  # noqa: E402
    from sqlalchemy.exc import SQLAlchemyError
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_session.query.side_effect = SQLAlchemyError("Connection failed")
        mock_sessionmaker.return_value.return_value = mock_session
        
        with pytest.raises(SQLAlchemyError):
            read_todos_from_local_postgres("postgresql://test")

