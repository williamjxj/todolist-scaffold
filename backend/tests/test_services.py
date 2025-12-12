import pytest
from app.services.todo_service import TodoService
from app.models import TodoItem


def test_create_todo(db):
    """Test creating a TODO item via service"""
    service = TodoService(db)
    todo = service.create("Test TODO")
    assert todo.description == "Test TODO"
    assert todo.completed is False
    assert todo.id is not None


def test_create_todo_empty_description(db):
    """Test creating TODO with empty description raises ValueError"""
    service = TodoService(db)
    with pytest.raises(ValueError, match="cannot be empty"):
        service.create("   ")


def test_create_todo_too_long(db):
    """Test creating TODO with description exceeding 500 characters raises ValueError"""
    service = TodoService(db)
    long_description = "a" * 501
    with pytest.raises(ValueError, match="cannot exceed 500"):
        service.create(long_description)


def test_get_all_todos(db):
    """Test getting all TODO items"""
    service = TodoService(db)
    service.create("TODO 1")
    service.create("TODO 2")
    todos = service.get_all()
    assert len(todos) == 2


def test_get_all_todos_filtered(db):
    """Test getting TODO items filtered by completion status"""
    service = TodoService(db)
    todo1 = service.create("TODO 1")
    todo2 = service.create("TODO 2")
    service.toggle_complete(todo1.id)

    pending = service.get_all(completed=False)
    completed = service.get_all(completed=True)

    assert len(pending) == 1
    assert len(completed) == 1
    assert pending[0].id == todo2.id
    assert completed[0].id == todo1.id


def test_get_by_id(db):
    """Test getting a TODO item by ID"""
    service = TodoService(db)
    created = service.create("Test TODO")
    found = service.get_by_id(created.id)
    assert found is not None
    assert found.id == created.id
    assert found.description == "Test TODO"


def test_get_by_id_not_found(db):
    """Test getting a non-existent TODO returns None"""
    service = TodoService(db)
    found = service.get_by_id(999)
    assert found is None


def test_update_todo(db):
    """Test updating a TODO item"""
    service = TodoService(db)
    todo = service.create("Original")
    updated = service.update(todo.id, description="Updated")
    assert updated is not None
    assert updated.description == "Updated"


def test_toggle_complete(db):
    """Test toggling completion status"""
    service = TodoService(db)
    todo = service.create("Test TODO")
    assert todo.completed is False

    toggled = service.toggle_complete(todo.id)
    assert toggled is not None
    assert toggled.completed is True

    toggled_again = service.toggle_complete(todo.id)
    assert toggled_again is not None
    assert toggled_again.completed is False


def test_delete_todo(db):
    """Test deleting a TODO item"""
    service = TodoService(db)
    todo = service.create("Test TODO")
    success = service.delete(todo.id)
    assert success is True

    found = service.get_by_id(todo.id)
    assert found is None


def test_delete_todo_not_found(db):
    """Test deleting a non-existent TODO returns False"""
    service = TodoService(db)
    success = service.delete(999)
    assert success is False
