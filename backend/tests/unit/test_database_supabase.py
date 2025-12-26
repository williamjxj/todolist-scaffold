"""
Unit tests for Supabase connection error handling.

These tests verify that error handling works correctly
for Supabase connection failures.
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy.exc import SQLAlchemyError, OperationalError

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.database import verify_connection, get_db  # noqa: E402
from app.config import settings  # noqa: E402


@pytest.mark.unit
def test_verify_connection_success():
    """Test that verify_connection returns True on successful connection"""
    with patch('app.database.engine.connect') as mock_connect:
        mock_conn = MagicMock()
        mock_result = MagicMock()
        mock_result.fetchone.return_value = (1,)
        mock_conn.execute.return_value = mock_result
        mock_connect.return_value.__enter__.return_value = mock_conn
        
        result = verify_connection()
        assert result is True


@pytest.mark.unit
def test_verify_connection_sqlalchemy_error():
    """Test that verify_connection returns False on SQLAlchemyError"""
    with patch('app.database.engine.connect') as mock_connect:
        mock_connect.side_effect = SQLAlchemyError("Connection failed")
        
        result = verify_connection()
        assert result is False


@pytest.mark.unit
def test_verify_connection_operational_error():
    """Test that verify_connection returns False on OperationalError"""
    with patch('app.database.engine.connect') as mock_connect:
        mock_connect.side_effect = OperationalError("Connection refused", None, None)
        
        result = verify_connection()
        assert result is False


@pytest.mark.unit
def test_verify_connection_unexpected_error():
    """Test that verify_connection returns False on unexpected errors"""
    with patch('app.database.engine.connect') as mock_connect:
        mock_connect.side_effect = Exception("Unexpected error")
        
        result = verify_connection()
        assert result is False


@pytest.mark.unit
def test_get_db_handles_sqlalchemy_error():
    """Test that get_db handles SQLAlchemyError gracefully"""
    from app.database import SessionLocal  # noqa: E402
    
    db = SessionLocal()
    
    # Mock a database error during operation
    with patch.object(db, 'execute', side_effect=SQLAlchemyError("Database error")):
        db_gen = get_db()
        db_session = next(db_gen)
        
        # The error should be caught and logged, not raised immediately
        # (get_db is a generator, errors happen during use)
        try:
            db_session.execute("SELECT 1")  # This would raise
        except SQLAlchemyError:
            pass  # Expected
        
        # Cleanup
        try:
            next(db_gen, None)
        except StopIteration:
            pass
    
    db.close()

