from pathlib import Path
from typing import Optional, Union, List

from pydantic import validator, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    # DB_BACKEND controls which database engine is used.
    # - "sqlite": use local SQLite file (default)
    # - "postgresql": use a PostgreSQL instance (e.g., on this MacBook Pro)
    # - "supabase": use cloud-hosted Supabase (PostgreSQL-compatible)
    DB_BACKEND: str = "sqlite"
    DATABASE_URL: str = "sqlite:///./todos.db"
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        """
        Validate database URL format and provide clear error messages.
        
        For Supabase connections, ensures SSL is recommended.
        """
        if not v:
            raise ValueError("DATABASE_URL cannot be empty")
        
        # Check for Supabase connection string
        if "supabase" in v.lower():
            # Warn if SSL is not explicitly required (will be added automatically in database.py)
            if "sslmode" not in v.lower():
                import warnings
                warnings.warn(
                    "Supabase connection string should include sslmode=require. "
                    "It will be added automatically, but it's recommended to include it explicitly.",
                    UserWarning
                )
        
        # Validate PostgreSQL connection string format
        if v.startswith("postgresql"):
            if "@" not in v or "://" not in v:
                raise ValueError(
                    "Invalid PostgreSQL connection string format. "
                    "Expected format: postgresql+psycopg://user:password@host:port/database"
                )
        
        return v
    
    # Supabase Configuration (optional, for future features like auth, storage, realtime)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # CORS - Allow common development origins
    # In production, specify exact origins via CORS_ORIGINS env var (comma-separated)
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:5174",
        ],
        description="CORS allowed origins (comma-separated string or list)"
    )

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v) -> List[str]:
        # Default list if not provided
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:5174",
        ]
        
        # Handle None or empty string
        if v is None:
            return default_origins
        if isinstance(v, str) and v.strip() == "":
            return default_origins
        
        # Handle string (comma-separated or JSON)
        if isinstance(v, str):
            # If it looks like JSON array, try to parse it
            v_stripped = v.strip()
            if v_stripped.startswith("["):
                try:
                    import json
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        result = [str(item).strip() for item in parsed if item]
                        return result if result else default_origins
                except (json.JSONDecodeError, ValueError):
                    # If JSON parsing fails, treat as comma-separated
                    pass
            # Treat as comma-separated
            result = [i.strip() for i in v.split(",") if i.strip()]
            return result if result else default_origins
        
        # Handle list (if somehow we get a list)
        if isinstance(v, list):
            result = [str(item).strip() for item in v if item]
            return result if result else default_origins
        
        # Fallback to default
        return default_origins

    # API
    API_V1_PREFIX: str = "/api"

    # Additional optional environment variables (for migration scripts, etc.)
    PORT: Optional[str] = None
    DATABASE_URL_MIGRATION: Optional[str] = None

    class Config:
        # Always load environment variables from the backend/.env file,
        # regardless of the current working directory when the process starts.
        _backend_root = Path(__file__).resolve().parents[2]
        env_file = _backend_root / ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env that aren't defined in Settings


settings = Settings()
