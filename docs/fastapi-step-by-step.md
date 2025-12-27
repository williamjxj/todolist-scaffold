# FastAPI Step-by-Step Implementation Guide

**Feature**: TODO List Application  
**Date**: 2025-12-12  
**Target Audience**: Developers learning FastAPI from scratch

This guide walks through building the FastAPI backend step-by-step, explaining each decision and implementation detail.

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Virtual Environment](#2-virtual-environment)
3. [Dependencies](#3-dependencies)
4. [Project Structure](#4-project-structure)
5. [Configuration](#5-configuration)
6. [Database Setup](#6-database-setup)
7. [Models](#7-models)
8. [Schemas](#8-schemas)
9. [Service Layer](#9-service-layer)
10. [API Routes](#10-api-routes)
11. [Main Application](#11-main-application)
12. [Database Initialization](#12-database-initialization)
13. [Testing](#13-testing)
14. [Running the Server](#14-running-the-server)

---

## 1. Project Setup

### 1.1 Create Backend Directory

```bash
mkdir backend
cd backend
```

### 1.2 Initialize Git (if not already done)

```bash
git init  # If starting fresh
```

### 1.3 Create Directory Structure

```bash
mkdir -p src/app/api/routes
mkdir -p src/app/services
mkdir -p tests
```

**Why this structure?**

- `src/` - Source code directory (Python best practice)
- `app/` - Application package
- `api/routes/` - API endpoint definitions
- `services/` - Business logic layer (separated from routes)
- `tests/` - Test files

---

## 2. Virtual Environment

### 2.1 Create Virtual Environment

```bash
python -m venv venv
```

**What this does:**

- Creates an isolated Python environment in `venv/`
- Prevents dependency conflicts with system Python
- Allows project-specific package versions

### 2.2 Activate Virtual Environment

**macOS/Linux:**

```bash
source venv/bin/activate
```

**Windows:**

```bash
venv\Scripts\activate
```

**Verify activation:**

- Terminal prompt shows `(venv)`
- `which python` points to `venv/bin/python`

### 2.3 Deactivate (when done)

```bash
deactivate
```

---

## 3. Dependencies

### 3.1 Create `requirements.txt`

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
pydantic-settings==2.1.0
```

**Explanation:**

- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server (runs FastAPI)
- `sqlalchemy` - ORM for database operations
- `pydantic` - Data validation
- `pydantic-settings` - Settings management

### 3.2 Create `requirements-dev.txt`

```txt
pytest==7.4.4
pytest-asyncio==0.21.1
httpx==0.26.0
black==24.1.1
flake8==7.0.0
mypy==1.8.0
```

**Explanation:**

- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `httpx` - HTTP client for testing
- `black` - Code formatter
- `flake8` - Linter
- `mypy` - Type checker

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

**Verify installation:**

```bash
pip list | grep fastapi
```

---

## 4. Project Structure

### 4.1 Create Package Files

**`src/app/__init__.py`** (empty file):

```python
# Package marker
```

**`src/app/api/__init__.py`**:

```python
# API package
```

**`src/app/api/routes/__init__.py`**:

```python
# Routes package
```

**`src/app/services/__init__.py`**:

```python
# Services package
```

**Why `__init__.py`?**

- Makes directories Python packages
- Allows imports like `from app.api.routes import todos`

---

## 5. Configuration

### 5.1 Create `src/app/config.py`

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = "sqlite:///./todos.db"

    # CORS - Allow common development origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # API
    API_V1_PREFIX: str = "/api"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

**Key Concepts:**

- `BaseSettings` - Pydantic class for settings management
- `DATABASE_URL` - SQLite connection string
  - `sqlite:///./todos.db` - Relative path (creates in current directory)
- `CORS_ORIGINS` - Allowed frontend origins
- Environment variables can override defaults via `.env` file

**Why this approach?**

- Type-safe configuration
- Environment variable support
- Centralized settings management

---

## 6. Database Setup

### 6.1 Create `src/app/database.py`

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
    print("Database initialized successfully! Created todos.db")
```

**Step-by-Step Explanation:**

1. **`create_engine`**: Creates database connection pool
   - `connect_args={"check_same_thread": False}` - Required for SQLite with FastAPI

2. **`SessionLocal`**: Factory for creating database sessions
   - `autocommit=False` - Manual transaction control
   - `autoflush=False` - Manual flush control

3. **`Base`**: Base class for SQLAlchemy models
   - All models inherit from this

4. **`get_db()`**: Dependency function for FastAPI
   - `yield` - Generator function (dependency injection)
   - Ensures database session is closed after request

5. **`init_db()`**: Creates all tables
   - Must import models before calling (so SQLAlchemy knows what to create)

**Why dependency injection?**

- Automatic session management
- Ensures sessions are closed
- Testable (can mock `get_db`)

---

## 7. Models

### 7.1 Create `src/app/models.py`

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

**Field-by-Field Explanation:**

1. **`id`**: Primary key
   - `Integer` - Auto-incrementing integer
   - `primary_key=True` - Unique identifier
   - `index=True` - Database index for faster lookups

2. **`description`**: TODO text
   - `Text` - Unlimited length (vs `String` which has limits)
   - `nullable=False` - Required field

3. **`completed`**: Completion status
   - `Boolean` - True/False
   - `default=False` - New items are incomplete
   - `nullable=False` - Required field

4. **`created_at`**: Creation timestamp
   - `DateTime` - Date and time
   - `server_default=func.now()` - Set by database on insert

5. **`updated_at`**: Last update timestamp
   - `onupdate=func.now()` - Auto-updated on row update

**Why SQLAlchemy models?**

- Database-agnostic (can switch from SQLite to PostgreSQL)
- Type-safe Python objects
- Automatic relationship handling

---

## 8. Schemas

### 8.1 Create `src/app/schemas.py`

```python
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class TodoItemBase(BaseModel):
    """Base schema with common fields"""
    description: str = Field(..., min_length=1, max_length=500)


class TodoItemCreate(TodoItemBase):
    """Schema for creating a TODO item"""
    pass


class TodoItemUpdate(BaseModel):
    """Schema for updating a TODO item"""
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    completed: Optional[bool] = None


class TodoItemResponse(TodoItemBase):
    """Schema for TODO item response"""
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

**Schema-by-Schema Explanation:**

1. **`TodoItemBase`**: Shared fields
   - `Field(..., min_length=1, max_length=500)` - Validation rules
   - `...` means required

2. **`TodoItemCreate`**: For POST requests
   - Inherits from `TodoItemBase`
   - Only needs `description` (id, timestamps auto-generated)

3. **`TodoItemUpdate`**: For PUT/PATCH requests
   - All fields optional (partial updates)
   - Can update `description` or `completed` or both

4. **`TodoItemResponse`**: For GET responses
   - Includes all fields including auto-generated ones
   - `from_attributes=True` - Allows conversion from SQLAlchemy models

**Why Pydantic schemas?**

- Automatic validation
- Type conversion
- API documentation generation
- Clear separation from database models

---

## 9. Service Layer

### 9.1 Create `src/app/services/todo_service.py`

```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import TodoItem
from app.schemas import TodoItemCreate, TodoItemUpdate
from typing import List, Optional


class TodoService:
    """Business logic for TODO operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, completed: Optional[bool] = None) -> List[TodoItem]:
        """Get all TODO items, optionally filtered by completion status"""
        query = self.db.query(TodoItem)
        
        if completed is not None:
            query = query.filter(TodoItem.completed == completed)
        
        return query.order_by(TodoItem.created_at.desc()).all()

    def get_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """Get a TODO item by ID"""
        return self.db.query(TodoItem).filter(TodoItem.id == todo_id).first()

    def create(self, todo_data: TodoItemCreate) -> TodoItem:
        """Create a new TODO item"""
        todo = TodoItem(description=todo_data.description)
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def update(self, todo_id: int, todo_data: TodoItemUpdate) -> Optional[TodoItem]:
        """Update a TODO item"""
        todo = self.get_by_id(todo_id)
        if not todo:
            return None
        
        if todo_data.description is not None:
            todo.description = todo_data.description
        if todo_data.completed is not None:
            todo.completed = todo_data.completed
        
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete(self, todo_id: int) -> bool:
        """Delete a TODO item"""
        todo = self.get_by_id(todo_id)
        if not todo:
            return False
        
        self.db.delete(todo)
        self.db.commit()
        return True

    def toggle_complete(self, todo_id: int) -> Optional[TodoItem]:
        """Toggle completion status of a TODO item"""
        todo = self.get_by_id(todo_id)
        if not todo:
            return None
        
        todo.completed = not todo.completed
        self.db.commit()
        self.db.refresh(todo)
        return todo
```

**Method-by-Method Explanation:**

1. **`get_all`**: List todos
   - Optional `completed` filter
   - Ordered by creation date (newest first)

2. **`get_by_id`**: Get single todo
   - Returns `None` if not found

3. **`create`**: Create new todo
   - `db.add()` - Add to session
   - `db.commit()` - Save to database
   - `db.refresh()` - Reload from database (gets auto-generated fields)

4. **`update`**: Update existing todo
   - Partial updates (only provided fields)
   - Returns `None` if todo not found

5. **`delete`**: Delete todo
   - Returns `False` if not found

6. **`toggle_complete`**: Toggle completion
   - Convenience method for common operation

**Why a service layer?**

- Separates business logic from API routes
- Reusable across different interfaces
- Easier to test
- Single responsibility principle

---

## 10. API Routes

### 10.1 Create `src/app/api/routes/todos.py`

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
    
    - **description**: TODO item description (required, 1-500 characters)
    """
    service = TodoService(db)
    return service.create(todo)


@router.get("/{todo_id}", response_model=TodoItemResponse)
async def get_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a TODO item by ID.
    
    - **todo_id**: TODO item ID
    """
    service = TodoService(db)
    todo = service.get_by_id(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {todo_id} not found"
        )
    return todo


@router.put("/{todo_id}", response_model=TodoItemResponse)
async def update_todo(
    todo_id: int,
    todo: TodoItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a TODO item.
    
    - **todo_id**: TODO item ID
    - **description**: Updated description (optional)
    - **completed**: Updated completion status (optional)
    """
    service = TodoService(db)
    updated_todo = service.update(todo_id, todo)
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {todo_id} not found"
        )
    return updated_todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a TODO item.
    
    - **todo_id**: TODO item ID
    """
    service = TodoService(db)
    if not service.delete(todo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {todo_id} not found"
        )


@router.patch("/{todo_id}/complete", response_model=TodoItemResponse)
async def toggle_complete(
    todo_id: int,
    db: Session = Depends(get_db)
):
    """
    Toggle completion status of a TODO item.
    
    - **todo_id**: TODO item ID
    """
    service = TodoService(db)
    todo = service.toggle_complete(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TODO item with id {todo_id} not found"
        )
    return todo
```

**Route-by-Route Explanation:**

1. **`GET /`**: List all todos
   - Query parameter: `?completed=true/false`
   - Returns list of todos

2. **`POST /`**: Create todo
   - Request body: `TodoItemCreate`
   - Returns created todo (201 status)

3. **`GET /{todo_id}`**: Get single todo
   - Path parameter: `todo_id`
   - Returns 404 if not found

4. **`PUT /{todo_id}`**: Update todo
   - Path parameter: `todo_id`
   - Request body: `TodoItemUpdate` (partial)
   - Returns 404 if not found

5. **`DELETE /{todo_id}`**: Delete todo
   - Path parameter: `todo_id`
   - Returns 204 (no content) on success
   - Returns 404 if not found

6. **`PATCH /{todo_id}/complete`**: Toggle completion
   - Path parameter: `todo_id`
   - Convenience endpoint

**FastAPI Decorators:**

- `@router.get/post/put/delete/patch` - HTTP method
- `response_model` - Response schema (for validation & docs)
- `Depends(get_db)` - Dependency injection
- `status_code` - HTTP status code

---

## 11. Main Application

### 11.1 Create `src/app/main.py`

```python
from fastapi import FastAPI
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


@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {"message": "TODO List API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
```

**Step-by-Step Explanation:**

1. **FastAPI Instance**:
   - `title`, `description`, `version` - Used in API docs

2. **CORS Middleware**:
   - Allows frontend to make requests
   - `allow_origins` - Frontend URLs
   - `allow_methods=["*"]` - All HTTP methods
   - `allow_headers=["*"]` - All headers

3. **Router Inclusion**:
   - `prefix="/api/todos"` - All routes prefixed
   - `tags=["todos"]` - Groups routes in docs

4. **Root Endpoints**:
   - `/` - API info
   - `/health` - Health check

---

## 12. Database Initialization

### 12.1 Create `backend/init_db.py`

```python
#!/usr/bin/env python3
"""
Database initialization script.
Run with: python init_db.py
"""
import sys
import os

# Add src to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(backend_dir, 'src')
sys.path.insert(0, src_dir)

# Change to src directory so database is created in the right location
os.chdir(src_dir)

# Import models so SQLAlchemy knows what tables to create
from app import models  # noqa: F401
from app.database import init_db

if __name__ == "__main__":
    print("Initializing database...")
    print(f"Creating database in: {os.path.join(os.getcwd(), 'todos.db')}")
    init_db()
    print("Done! Database file created: todos.db")
```

**Key Points:**

- Must import models before `init_db()` (so SQLAlchemy knows tables)
- Changes to `src/` directory (where server runs from)
- Creates `todos.db` in correct location

**Run it:**

```bash
cd backend
source venv/bin/activate
python init_db.py
```

---

## 13. Testing

### 13.1 Create `tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Create test database (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Create test client with test database"""
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### 13.2 Create `tests/test_todos.py`

```python
from fastapi import status


def test_create_todo(client):
    """Test creating a TODO item"""
    response = client.post(
        "/api/todos/",
        json={"description": "Test TODO"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Test TODO"
    assert data["completed"] is False
    assert "id" in data


def test_list_todos(client):
    """Test listing TODO items"""
    # Create a todo first
    client.post("/api/todos/", json={"description": "Test TODO"})
    
    # List todos
    response = client.get("/api/todos/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["description"] == "Test TODO"
```

**Run tests:**

```bash
cd backend
pytest
```

---

## 14. Running the Server

### 14.1 Create `backend/run.sh`

```bash
#!/bin/bash
# FastAPI development server startup script
# Run with: ./run.sh

cd "$(dirname "$0")/src"
uvicorn app.main:app --reload --port 8000
```

**Make it executable:**

```bash
chmod +x backend/run.sh
```

**Run it:**

```bash
cd backend
source venv/bin/activate
./run.sh
```

### 14.2 Alternative: Manual Start

```bash
cd backend/src
uvicorn app.main:app --reload --port 8000
```

### 14.3 Verify It Works

1. **Health check:**

   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

2. **API docs:**
   - Open <http://localhost:8000/docs> in browser

3. **Create a todo:**

   ```bash
   curl -X POST http://localhost:8000/api/todos/ \
     -H "Content-Type: application/json" \
     -d '{"description": "My first TODO"}'
   ```

---

## Summary

You've now built a complete FastAPI backend with:

✅ **Configuration** - Settings management  
✅ **Database** - SQLAlchemy setup  
✅ **Models** - Database schema  
✅ **Schemas** - API validation  
✅ **Services** - Business logic  
✅ **Routes** - API endpoints  
✅ **Testing** - Test suite  
✅ **Documentation** - Auto-generated API docs  

**Next Steps:**

- Connect frontend (see `docs/fastapi-react-tips.md`)
- Add authentication
- Deploy to production
- Add more features

**Resources:**

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
