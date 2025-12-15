from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    # DB_BACKEND controls which database engine is used.
    # - "sqlite": use local SQLite file (default)
    # - "postgresql": use a PostgreSQL instance (e.g., on this MacBook Pro)
    DB_BACKEND: str = "sqlite"
    DATABASE_URL: str = "sqlite:///./todos.db"

    # CORS - Allow common development origins
    # In production, specify exact origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5174",  # Vite fallback port
    ]

    # API
    API_V1_PREFIX: str = "/api"

    class Config:
        # Always load environment variables from the backend/.env file,
        # regardless of the current working directory when the process starts.
        _backend_root = Path(__file__).resolve().parents[2]
        env_file = _backend_root / ".env"
        case_sensitive = True


settings = Settings()
