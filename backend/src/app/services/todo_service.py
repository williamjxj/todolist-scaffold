from sqlalchemy.orm import Session
from typing import Optional, List
from app.models import TodoItem


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

    def update(self, id: int, description: Optional[str] = None, completed: Optional[bool] = None) -> Optional[TodoItem]:
        """Update a TODO item"""
        todo = self.get_by_id(id)
        if not todo:
            return None

        # Update description if provided
        if description is not None:
            description = description.strip()
            if not description:
                raise ValueError("Description cannot be empty or whitespace-only")
            if len(description) > 500:
                raise ValueError("Description cannot exceed 500 characters")
            todo.description = description

        # Update completion status if provided
        if completed is not None:
            todo.completed = completed

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
