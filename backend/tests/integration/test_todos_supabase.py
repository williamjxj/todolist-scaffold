"""
Integration tests for todo CRUD operations against Supabase.

These tests verify that all todo operations work correctly
when using Supabase as the database backend.
"""
import os
import sys
import pytest
from fastapi import status
from fastapi.testclient import TestClient

# Add src to path
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_src_dir = os.path.join(_backend_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from app.main import app  # noqa: E402
from app.config import settings  # noqa: E402
from app.database import Base, engine, SessionLocal  # noqa: E402


@pytest.fixture(scope="module")
def supabase_db():
    """
    Create test database session for Supabase.
    
    This fixture creates the todos table if it doesn't exist
    and provides a database session for testing.
    """
    # Skip if not using Supabase
    if not settings.DATABASE_URL or "supabase" not in settings.DATABASE_URL.lower():
        pytest.skip("Supabase connection not configured. Set DATABASE_URL with Supabase connection string.")
    
    # Create tables (only creates if they don't exist)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(supabase_db):
    """Create test client with Supabase database"""
    from app.database import get_db  # noqa: E402
    
    def override_get_db():
        try:
            yield supabase_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.mark.integration
def test_create_todo_supabase(client):
    """Test creating a TODO item in Supabase"""
    response = client.post(
        "/api/todos",
        json={"description": "Test TODO in Supabase"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Test TODO in Supabase"
    assert data["completed"] is False
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.integration
def test_list_todos_supabase(client):
    """Test listing TODO items from Supabase"""
    # Create a TODO first
    client.post("/api/todos", json={"description": "List Test TODO"})
    
    # List all
    response = client.get("/api/todos")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    # Should have at least the one we just created
    assert len(data) >= 1


@pytest.mark.integration
def test_get_todo_by_id_supabase(client):
    """Test getting a TODO item by ID from Supabase"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Get Test TODO"})
    todo_id = create_response.json()["id"]
    
    # Get by ID
    response = client.get(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == todo_id
    assert data["description"] == "Get Test TODO"


@pytest.mark.integration
def test_update_todo_supabase(client):
    """Test updating a TODO item in Supabase"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Original Description"})
    todo_id = create_response.json()["id"]
    
    # Update it
    response = client.put(
        f"/api/todos/{todo_id}",
        json={"description": "Updated Description"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["description"] == "Updated Description"


@pytest.mark.integration
def test_delete_todo_supabase(client):
    """Test deleting a TODO item from Supabase"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "To be deleted"})
    todo_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    response = client.get(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

