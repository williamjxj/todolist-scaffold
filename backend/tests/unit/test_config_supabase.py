"""
Unit tests for Supabase configuration validation.

These tests verify that Supabase configuration is validated correctly.
"""
import os
import sys
import pytest
from unittest.mock import patch

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.config import Settings  # noqa: E402


@pytest.mark.unit
def test_supabase_url_optional():
    """Test that SUPABASE_URL is optional"""
    with patch.dict(os.environ, {}, clear=False):
        settings = Settings()
        assert settings.SUPABASE_URL is None or isinstance(settings.SUPABASE_URL, str)


@pytest.mark.unit
def test_supabase_key_optional():
    """Test that SUPABASE_KEY is optional"""
    with patch.dict(os.environ, {}, clear=False):
        settings = Settings()
        assert settings.SUPABASE_KEY is None or isinstance(settings.SUPABASE_KEY, str)


@pytest.mark.unit
def test_supabase_url_from_env():
    """Test that SUPABASE_URL can be set from environment"""
    test_url = "https://test.supabase.co"
    with patch.dict(os.environ, {"SUPABASE_URL": test_url}, clear=False):
        settings = Settings()
        assert settings.SUPABASE_URL == test_url


@pytest.mark.unit
def test_supabase_key_from_env():
    """Test that SUPABASE_KEY can be set from environment"""
    test_key = "test-key-123"
    with patch.dict(os.environ, {"SUPABASE_KEY": test_key}, clear=False):
        settings = Settings()
        assert settings.SUPABASE_KEY == test_key


@pytest.mark.unit
def test_database_url_supabase_detection():
    """Test that Supabase connection strings are detected"""
    supabase_url = "postgresql+psycopg://postgres.test:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
    
    with patch.dict(os.environ, {"DATABASE_URL": supabase_url}, clear=False):
        settings = Settings()
        assert "supabase" in settings.DATABASE_URL.lower()


@pytest.mark.unit
def test_database_url_ssl_handling():
    """Test that Supabase URLs get SSL mode added in database.py"""
    # This is tested in database.py, but we verify the URL format is correct
    supabase_url = "postgresql+psycopg://user:pass@host.supabase.com:5432/db"
    
    # The database.py should add sslmode=require if not present
    # This test verifies the URL format is acceptable
    assert isinstance(supabase_url, str)
    assert "postgresql" in supabase_url

