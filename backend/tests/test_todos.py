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
    assert "created_at" in data
    assert "updated_at" in data


def test_create_todo_empty_description(client):
    """Test creating a TODO with empty description fails"""
    response = client.post(
        "/api/todos",
        json={"description": "   "}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_todo_too_long(client):
    """Test creating a TODO with description exceeding 500 characters fails"""
    long_description = "a" * 501
    response = client.post(
        "/api/todos",
        json={"description": long_description}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


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


def test_get_todo_by_id(client):
    """Test getting a TODO item by ID"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Test TODO"})
    todo_id = create_response.json()["id"]

    # Get by ID
    response = client.get(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == todo_id
    assert data["description"] == "Test TODO"


def test_get_todo_not_found(client):
    """Test getting a non-existent TODO returns 404"""
    response = client.get("/api/todos/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_todo(client):
    """Test updating a TODO item"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Original"})
    todo_id = create_response.json()["id"]

    # Update it
    response = client.put(
        f"/api/todos/{todo_id}",
        json={"description": "Updated"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["description"] == "Updated"


def test_toggle_complete(client):
    """Test toggling TODO completion status"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Test TODO"})
    todo_id = create_response.json()["id"]

    # Toggle complete
    response = client.patch(f"/api/todos/{todo_id}/complete")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["completed"] is True

    # Toggle back
    response = client.patch(f"/api/todos/{todo_id}/complete")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["completed"] is False


def test_delete_todo(client):
    """Test deleting a TODO item"""
    # Create a TODO first
    create_response = client.post("/api/todos", json={"description": "Test TODO"})
    todo_id = create_response.json()["id"]

    # Delete it
    response = client.delete(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's deleted
    response = client.get(f"/api/todos/{todo_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_todo_not_found(client):
    """Test deleting a non-existent TODO returns 404"""
    response = client.delete("/api/todos/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
