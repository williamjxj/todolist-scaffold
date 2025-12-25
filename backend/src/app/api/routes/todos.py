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
    priority: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all TODO items.

    - **completed**: Optional filter by completion status
    - **priority**: Optional filter by priority
    - **category**: Optional filter by category
    """
    service = TodoService(db)
    return service.get_all(completed=completed, priority=priority, category=category)


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
    try:
        return service.create(
            description=todo.description,
            priority=todo.priority,
            due_date=todo.due_date,
            category=todo.category
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


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
    try:
        todo = service.update(
            id,
            description=todo_update.description,
            completed=todo_update.completed,
            priority=todo_update.priority,
            due_date=todo_update.due_date,
            category=todo_update.category
        )
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"TODO item with id {id} not found"
            )
        return todo
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


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
