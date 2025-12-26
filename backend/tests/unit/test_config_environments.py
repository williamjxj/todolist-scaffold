"""
Unit tests for environment-specific configuration loading.

These tests verify that configuration works correctly in different environments.
"""
import os
import sys
import pytest
from unittest.mock import patch, mock_open
from pathlib import Path

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.config import Settings  # noqa: E402


@pytest.mark.unit
def test_config_loads_from_env_file():
    """Test that configuration loads from .env file"""
    # Settings should load from backend/.env file
    settings = Settings()
    
    # Verify it has the expected structure
    assert hasattr(settings, 'DATABASE_URL')
    assert hasattr(settings, 'DB_BACKEND')
    assert hasattr(settings, 'CORS_ORIGINS')
    assert hasattr(settings, 'SUPABASE_URL')
    assert hasattr(settings, 'SUPABASE_KEY')


@pytest.mark.unit
def test_config_env_file_path():
    """Test that .env file path is correctly resolved"""
    from app.config import Settings
    
    # The Config class should resolve to backend/.env
    config = Settings.Config
    env_file_path = config.env_file
    
    # Should be a Path object pointing to backend/.env
    assert isinstance(env_file_path, Path)
    assert env_file_path.name == ".env"
    assert "backend" in str(env_file_path)


@pytest.mark.unit
def test_config_environment_variable_override():
    """Test that environment variables override .env file values"""
    test_db_url = "postgresql://test-override:5432/testdb"
    
    with patch.dict(os.environ, {"DATABASE_URL": test_db_url}, clear=False):
        settings = Settings()
        # Environment variable should override .env file
        assert settings.DATABASE_URL == test_db_url


@pytest.mark.unit
def test_config_default_values():
    """Test that default values are used when not set"""
    # Create settings with minimal environment
    with patch.dict(os.environ, {}, clear=False):
        # Mock the .env file to be empty or not exist
        with patch('pathlib.Path.exists', return_value=False):
            # This will use defaults
            settings = Settings()
            assert settings.DB_BACKEND == "sqlite"
            assert "sqlite" in settings.DATABASE_URL.lower()


@pytest.mark.unit
def test_config_case_sensitive():
    """Test that configuration is case-sensitive"""
    # Settings should be case-sensitive
    settings = Settings()
    
    # Verify case-sensitive field access
    assert hasattr(settings, 'DATABASE_URL')
    assert hasattr(settings, 'DB_BACKEND')
    # Should not have lowercase versions
    assert not hasattr(settings, 'database_url')


@pytest.mark.unit
def test_config_extra_fields_ignored():
    """Test that extra fields in .env are ignored"""
    # Settings should ignore extra fields (PORT, DATABASE_URL_MIGRATION, etc.)
    settings = Settings()
    
    # These fields are defined but should not cause errors if present in .env
    assert hasattr(settings, 'PORT')
    assert hasattr(settings, 'DATABASE_URL_MIGRATION')
    
    # Other extra fields should be ignored due to extra = "ignore"
    # This is tested implicitly - if extra fields caused errors, Settings() would fail

