# FastAPI Implementation Details

**Feature**: TODO List Application  
**Date**: 2025-01-27  
**Target Audience**: Entry-level developers learning FastAPI

This document provides detailed implementation guidance for the FastAPI backend, focusing on best practices and explaining key concepts for developers new to FastAPI.

## Table of Contents

1. [FastAPI Overview](#fastapi-overview)
2. [Initial Environment Setup](#initial-environment-setup)
3. [Project Structure](#project-structure)
4. [Application Setup](#application-setup)
5. [Database Configuration](#database-configuration)
6. [Models and Schemas](#models-and-schemas)
7. [API Routes](#api-routes)
8. [Service Layer](#service-layer)
9. [Error Handling](#error-handling)
10. [CORS Configuration](#cors-configuration)
11. [Testing](#testing)
12. [Best Practices](#best-practices)

## FastAPI Overview

### What is FastAPI?

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. Key features:

- **Fast**: One of the fastest Python frameworks (comparable to Node.js and Go)
- **Easy**: Designed to be easy to use and learn
- **Standards-based**: Based on (and fully compatible with) open standards:
  - OpenAPI (formerly Swagger) for API documentation
  - JSON Schema for data validation
  - OAuth2 for authentication
- **Type-safe**: Uses Python type hints for automatic validation and documentation

### Why FastAPI for This Project?

1. **Automatic API Documentation**: FastAPI generates interactive API docs automatically
2. **Type Safety**: Python type hints ensure data validation
3. **Async Support**: Modern async/await syntax for better performance
4. **Easy to Learn**: Simple, intuitive API design
5. **Great for Demos**: Interactive docs make it perfect for learning

## Initial Environment Setup

### Prerequisites

Before starting, ensure you have:

- **Python 3.11 or higher** installed
- **pip** (Python package manager) installed

Verify installation:

```bash
python --version  # Should show 3.11 or higher
pip --version
```

### Step 1: Create Virtual Environment

**Why use a virtual environment?**

- Isolates project dependencies from system Python
- Prevents dependency conflicts between projects
- Makes dependency management reproducible
- **Best practice** for all Python projects

**Create the virtual environment:**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
```

This creates a `venv/` directory containing an isolated Python environment.

### Step 2: Activate Virtual Environment

**On macOS/Linux:**

```bash
source venv/bin/activate
```

**On Windows:**

```bash
venv\Scripts\activate
```

**Verify activation:**

- Your terminal prompt should show `(venv)` prefix
- Running `which python` (macOS/Linux) or `where python` (Windows) should point to `venv/bin/python`

### Step 3: Install Dependencies

**Create requirements files:**

**`backend/requirements.txt`** (production dependencies):

```txt
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
```

**`backend/requirements-dev.txt`** (development dependencies):

```txt
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.24.0
black>=23.0.0
flake8>=6.0.0
mypy>=1.5.0
```

**Install dependencies:**

```bash
# Make sure virtual environment is activated
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

**Verify installation:**

```bash
pip list  # Should show FastAPI, SQLAlchemy, etc.
fastapi --version  # Should show version number
```

### Step 4: Verify Setup

Test that FastAPI can be imported:

```bash
python -c "import fastapi; print(fastapi.__version__)"
```

### Deactivating Virtual Environment

When done working:

```bash
deactivate
```

### Important Notes

- **Always activate virtual environment** before running Python commands
- **Never commit `venv/` directory** to git (add to `.gitignore`)
- **Always commit `requirements.txt`** files to version control
- **Recreate virtual environment** if it gets corrupted: `rm -rf venv && python -m venv venv`

### Official Documentation References

- **FastAPI Installation**: <https://fastapi.tiangolo.com/#installation>
- **Python Virtual Environments**: <https://docs.python.org/3/tutorial/venv.html>
- **pip User Guide**: <https://pip.pypa.io/en/stable/>

## Project Structure

```
backend/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI application instance
│       ├── config.py            # Configuration settings
│       ├── database.py          # Database connection and session management
│       ├── models.py            # SQLAlchemy ORM models
│       ├── schemas.py           # Pydantic models for request/response
│       ├── api/
│       │   ├── __init__.py
│       │   └── routes/
│       │       ├── __init__.py
│       │       └── todos.py     # TODO endpoints
│       └── services/
│           ├── __init__.py
│           └── todo_service.py  # Business logic
└── tests/
    ├── conftest.py              # pytest fixtures
    └── test_todos.py            # API tests
```

## Application Setup

### 1. Create FastAPI Application Instance

**File**: `backend/src/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import todos
from app.config import settings

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

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {"message": "TODO List API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
```

**Key Concepts**:

- `FastAPI()`: Creates the application instance
- `CORSMiddleware`: Allows frontend (different origin) to call backend
- `include_router()`: Adds route handlers from separate modules
- Decorators (`@app.get()`): Define HTTP endpoints

### 2. Configuration Management

**File**: `backend/src/app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./todos.db"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    
    # API
    API_V1_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**Key Concepts**:

- `BaseSettings`: Pydantic class for configuration management
- Environment variables: Can override defaults via `.env` file
- Type hints: Ensures correct types for all settings

## Database Configuration

### 1. Database Connection

**File**: `backend/src/app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite-specific
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """
    Dependency function to get database session.
    FastAPI will call this for each request that needs database access.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
```

**Key Concepts**:

- `create_engine()`: Creates database connection pool
- `SessionLocal`: Factory for creating database sessions
- `declarative_base()`: Base class for SQLAlchemy models
- `get_db()`: Dependency injection function (FastAPI pattern)
- `yield`: Generator function - code after yield runs after request completes

### 2. Database Models (SQLAlchemy ORM)

**File**: `backend/src/app/models.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class TodoItem(Base):
    """SQLAlchemy model for TODO items"""
    
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<TodoItem(id={self.id}, description='{self.description[:20]}...', completed={self.completed})>"
```

**Key Concepts**:

- `Base`: Inherited from `declarative_base()` - makes this a database table
- `Column()`: Defines table columns with types and constraints
- `primary_key=True`: Marks column as primary key
- `index=True`: Creates database index for faster queries
- `server_default`: Database sets default value (not Python)
- `onupdate`: Automatically updates timestamp on row update

## Models and Schemas

### Pydantic Schemas

**File**: `backend/src/app/schemas.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TodoItemCreate(BaseModel):
    """Schema for creating a TODO item"""
    description: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="TODO item description"
    )

class TodoItemUpdate(BaseModel):
    """Schema for updating a TODO item"""
    description: Optional[str] = Field(
        None,
        min_length=1,
        max_length=500,
        description="Updated description"
    )
    completed: Optional[bool] = None

class TodoItemResponse(BaseModel):
    """Schema for TODO item response"""
    id: int
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
```

**Key Concepts**:

- `BaseModel`: Pydantic base class for data validation
- `Field()`: Adds validation rules (min_length, max_length)
- `...`: Required field (Ellipsis)
- `Optional[]`: Field can be None
- `from_attributes = True`: Enables conversion from SQLAlchemy models to Pydantic

## API Routes

### Route Handlers

**File**: `backend/src/app/api/routes/todos.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import TodoItemCreate, TodoItemUpdate, TodoItemResponse
from app.services.todo_service import TodoService

router = APIRouter()

@router.get("/", response_model=List[TodoItemResponse])
async def list_todos(
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    List all TODO items.
    
    - **completed**: Optional filter by completion status
    """
    service = TodoService(db)
    return service.get_all(completed=completed)

@router.post("/", response_model=TodoItemResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoItemCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new TODO item.
    
    - **description**: Required, 1-500 characters, not empty/whitespace
    """
    service = TodoService(db)
    return service.create(todo.description)

@router.get("/{id}", response_model=TodoItemResponse)
async def get_todo(
    id: int,
    db: Session = Depends(get_db)
):
    """Get a TODO item by ID"""
    service = TodoService(db)
    todo = service.get_by_id(id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {id} not found"
        )
    return todo

@router.put("/{id}", response_model=TodoItemResponse)
async def update_todo(
    id: int,
    todo_update: TodoItemUpdate,
    db: Session = Depends(get_db)
):
    """Update a TODO item"""
    service = TodoService(db)
    todo = service.update(id, todo_update)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {id} not found"
        )
    return todo

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    id: int,
    db: Session = Depends(get_db)
):
    """Delete a TODO item"""
    service = TodoService(db)
    success = service.delete(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {id} not found"
        )

@router.patch("/{id}/complete", response_model=TodoItemResponse)
async def toggle_complete(
    id: int,
    db: Session = Depends(get_db)
):
    """Toggle TODO item completion status"""
    service = TodoService(db)
    todo = service.toggle_complete(id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {id} not found"
        )
    return todo
```

**Key Concepts**:

- `APIRouter()`: Groups related endpoints
- `@router.get/post/put/delete/patch()`: HTTP method decorators
- `response_model`: FastAPI validates response matches schema
- `Depends(get_db)`: Dependency injection - FastAPI provides database session
- `HTTPException`: Raise HTTP errors with status codes
- `status_code`: Set HTTP status code for response

## Service Layer

### Business Logic

**File**: `backend/src/app/services/todo_service.py`

```python
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from app.models import TodoItem
from app.schemas import TodoItemUpdate

class TodoService:
    """Service layer for TODO item operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, completed: Optional[bool] = None) -> List[TodoItem]:
        """Get all TODO items, optionally filtered by completion status"""
        query = self.db.query(TodoItem)
        if completed is not None:
            query = query.filter(TodoItem.completed == completed)
        return query.order_by(TodoItem.created_at.desc()).all()
    
    def get_by_id(self, id: int) -> Optional[TodoItem]:
        """Get a TODO item by ID"""
        return self.db.query(TodoItem).filter(TodoItem.id == id).first()
    
    def create(self, description: str) -> TodoItem:
        """
        Create a new TODO item.
        
        Validates description is not empty/whitespace.
        """
        # Trim whitespace
        description = description.strip()
        
        # Validate not empty
        if not description:
            raise ValueError("Description cannot be empty or whitespace-only")
        
        # Validate length
        if len(description) > 500:
            raise ValueError("Description cannot exceed 500 characters")
        
        todo = TodoItem(description=description, completed=False)
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)  # Refresh to get database-generated fields (id, timestamps)
        return todo
    
    def update(self, id: int, todo_update: TodoItemUpdate) -> Optional[TodoItem]:
        """Update a TODO item"""
        todo = self.get_by_id(id)
        if not todo:
            return None
        
        # Update description if provided
        if todo_update.description is not None:
            description = todo_update.description.strip()
            if not description:
                raise ValueError("Description cannot be empty or whitespace-only")
            if len(description) > 500:
                raise ValueError("Description cannot exceed 500 characters")
            todo.description = description
        
        # Update completion status if provided
        if todo_update.completed is not None:
            todo.completed = todo_update.completed
        
        self.db.commit()
        self.db.refresh(todo)
        return todo
    
    def delete(self, id: int) -> bool:
        """Delete a TODO item"""
        todo = self.get_by_id(id)
        if not todo:
            return False
        
        self.db.delete(todo)
        self.db.commit()
        return True
    
    def toggle_complete(self, id: int) -> Optional[TodoItem]:
        """Toggle completion status of a TODO item"""
        todo = self.get_by_id(id)
        if not todo:
            return None
        
        todo.completed = not todo.completed
        self.db.commit()
        self.db.refresh(todo)
        return todo
```

**Key Concepts**:

- **Service Layer**: Separates business logic from API routes
- **Database Session**: Passed to service, not created inside
- **Query Methods**: SQLAlchemy query API (`filter()`, `order_by()`, etc.)
- **Transactions**: `commit()` saves changes to database
- **Refresh**: Reloads object from database to get updated values

## Error Handling

### Exception Handling

FastAPI automatically converts Python exceptions to HTTP responses. For custom errors:

```python
from fastapi import HTTPException, status

# In route handlers
if not todo:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="TODO item not found"
    )

# In service layer
try:
    todo = service.create(description)
except ValueError as e:
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=str(e)
    )
```

### Validation Errors

FastAPI automatically validates request data using Pydantic schemas. Invalid data returns 422 with details:

```json
{
  "detail": [
    {
      "loc": ["body", "description"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

## CORS Configuration

CORS (Cross-Origin Resource Sharing) allows the frontend (different origin) to call the backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # All HTTP methods
    allow_headers=["*"],  # All headers
)
```

**For Production**: Replace `allow_origins` with specific frontend domain(s).

## Testing

### Test Setup

**File**: `backend/tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Test database (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    """Create test client with test database"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
```

### Example Test

**File**: `backend/tests/test_todos.py`

```python
from fastapi import status

def test_create_todo(client):
    """Test creating a TODO item"""
    response = client.post(
        "/api/todos",
        json={"description": "Test TODO"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Test TODO"
    assert data["completed"] is False
    assert "id" in data

def test_list_todos(client):
    """Test listing TODO items"""
    # Create a TODO first
    client.post("/api/todos", json={"description": "Test TODO"})
    
    # List all
    response = client.get("/api/todos")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["description"] == "Test TODO"
```

## Best Practices

### 1. Use Type Hints Everywhere

```python
def get_todo(id: int, db: Session = Depends(get_db)) -> TodoItemResponse:
    # Type hints enable validation and documentation
```

### 2. Separate Concerns

- **Routes**: Handle HTTP requests/responses
- **Services**: Business logic
- **Models**: Database structure
- **Schemas**: API contracts

### 3. Use Dependency Injection

```python
# FastAPI automatically provides database session
def get_todo(id: int, db: Session = Depends(get_db)):
    # db is automatically provided
```

### 4. Validate Input

- Pydantic schemas validate request data automatically
- Additional validation in service layer for business rules

### 5. Handle Errors Gracefully

```python
# Return appropriate HTTP status codes
raise HTTPException(status_code=404, detail="Not found")
```

### 6. Use Async When Needed

```python
# FastAPI supports async/await
async def get_todos(db: Session = Depends(get_db)):
    # Can use async database operations
```

### 7. Document Your API

```python
@router.get("/", response_model=List[TodoItemResponse])
async def list_todos(
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    List all TODO items.
    
    - **completed**: Optional filter by completion status
    """
```

FastAPI automatically generates OpenAPI docs from docstrings and type hints.

## Summary

FastAPI provides:

- ✅ Automatic API documentation
- ✅ Type-safe request/response validation
- ✅ Easy async support
- ✅ Simple, intuitive API
- ✅ Great developer experience

This implementation follows FastAPI best practices and is designed to be easy to understand for entry-level developers while demonstrating production-ready patterns.

For more information, see:

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
