from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
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
        env_file = ".env"
        case_sensitive = True


settings = Settings()
