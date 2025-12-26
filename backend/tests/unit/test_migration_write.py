"""
Unit tests for migration script data writing logic.

These tests verify that the migration script can correctly
write todos to Supabase.
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.models import TodoItem  # noqa: E402


@pytest.mark.unit
def test_write_todos_to_supabase_success():
    """Test successful writing of todos to Supabase"""
    from backend.migrate_to_supabase import write_todos_to_supabase  # noqa: E402
    
    # Create mock todos
    mock_todos = [
        MagicMock(
            spec=TodoItem,
            id=1,
            description="Test 1",
            completed=False,
            priority="Medium",
            due_date=None,
            category=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
        MagicMock(
            spec=TodoItem,
            id=2,
            description="Test 2",
            completed=True,
            priority="High",
            due_date=datetime.now(),
            category="Work",
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
    ]
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_sessionmaker.return_value.return_value = mock_session
        
        result = write_todos_to_supabase(mock_todos, "postgresql://supabase")
        
        assert result == 2
        assert mock_session.merge.call_count == 2
        mock_session.commit.assert_called_once()


@pytest.mark.unit
def test_write_todos_to_supabase_empty():
    """Test writing empty list of todos"""
    from backend.migrate_to_supabase import write_todos_to_supabase  # noqa: E402
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_sessionmaker.return_value.return_value = mock_session
        
        result = write_todos_to_supabase([], "postgresql://supabase")
        
        assert result == 0
        mock_session.merge.assert_not_called()
        mock_session.commit.assert_called_once()


@pytest.mark.unit
def test_write_todos_to_supabase_with_ssl():
    """Test that Supabase URL gets SSL mode added"""
    from backend.migrate_to_supabase import write_todos_to_supabase  # noqa: E402
    
    mock_todos = [
        MagicMock(
            spec=TodoItem,
            id=1,
            description="Test",
            completed=False,
            priority="Medium",
            due_date=None,
            category=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
    ]
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_sessionmaker.return_value.return_value = mock_session
        
        url_without_ssl = "postgresql://user:pass@host:5432/db"
        write_todos_to_supabase(mock_todos, url_without_ssl)
        
        # Check that create_engine was called with URL containing sslmode=require
        call_args = mock_engine.call_args[0][0]
        assert "sslmode=require" in call_args


@pytest.mark.unit
def test_write_todos_to_supabase_error_handling():
    """Test error handling when writing fails"""
    from backend.migrate_to_supabase import write_todos_to_supabase  # noqa: E402
    from sqlalchemy.exc import SQLAlchemyError
    
    mock_todos = [
        MagicMock(
            spec=TodoItem,
            id=1,
            description="Test",
            completed=False,
            priority="Medium",
            due_date=None,
            category=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
    ]
    
    with patch('backend.migrate_to_supabase.create_engine') as mock_engine, \
         patch('backend.migrate_to_supabase.sessionmaker') as mock_sessionmaker:
        
        mock_session = MagicMock()
        mock_session.commit.side_effect = SQLAlchemyError("Write failed")
        mock_sessionmaker.return_value.return_value = mock_session
        
        with pytest.raises(SQLAlchemyError):
            write_todos_to_supabase(mock_todos, "postgresql://supabase")
        
        mock_session.rollback.assert_called_once()

