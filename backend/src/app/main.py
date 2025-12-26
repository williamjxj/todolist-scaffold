import logging
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import todos
from app.database import verify_connection

logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="TODO List API",
    description="RESTful API for managing TODO items",
    version="1.0.0",
)

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])


@app.on_event("startup")
async def startup_event():
    """Verify database connection on application startup"""
    logger.info("Starting application...")
    if not verify_connection():
        logger.error("Failed to connect to database on startup. Please check your configuration.")
        # Don't raise exception - allow app to start but log the error
        # This allows the app to start even if DB is temporarily unavailable
        # Individual requests will handle connection errors

@app.get("/hey")
async def hey():
    """Hey endpoint"""
    return {"message": "Hey there!"}

@app.get("/docs")
async def docs():
    """Swagger UI documentation"""
    return RedirectResponse(url="/docs")

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {"message": "TODO List API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint with database connectivity check"""
    db_status = verify_connection()
    return {
        "status": "healthy" if db_status else "degraded",
        "database": "connected" if db_status else "disconnected"
    }


@app.get("/health/db")
async def database_health_check():
    """
    Database connectivity verification endpoint.
    
    Returns detailed database connection status including:
    - Connection status
    - Database type (SQLite, PostgreSQL, Supabase)
    - Connection time (if available)
    """
    import time
    start_time = time.time()
    db_status = verify_connection()
    connection_time = time.time() - start_time
    
    db_url = settings.DATABASE_URL
    db_type = "unknown"
    if db_url.startswith("sqlite"):
        db_type = "SQLite"
    elif "supabase" in db_url.lower():
        db_type = "Supabase"
    elif db_url.startswith("postgresql"):
        db_type = "PostgreSQL"
    
    return {
        "status": "connected" if db_status else "disconnected",
        "database_type": db_type,
        "connection_time_seconds": round(connection_time, 3),
        "connection_string": db_url.split("@")[1] if "@" in db_url else "configured"  # Hide credentials
    }
