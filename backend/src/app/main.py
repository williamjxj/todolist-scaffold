from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import todos

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
    """Health check endpoint"""
    return {"status": "healthy"}
