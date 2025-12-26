import logging
import time
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.models import TodoItem

logger = logging.getLogger(__name__)


class TodoService:
    """Service layer for TODO item operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, completed: Optional[bool] = None, priority: Optional[str] = None, category: Optional[str] = None) -> List[TodoItem]:
        """Get all TODO items, with optional filters"""
        start_time = time.time()
        query = self.db.query(TodoItem)
        if completed is not None:
            query = query.filter(TodoItem.completed == completed)
        if priority is not None:
            query = query.filter(TodoItem.priority == priority)
        if category is not None:
            query = query.filter(TodoItem.category == category)
        result = query.order_by(TodoItem.created_at.desc()).all()
        query_time = time.time() - start_time
        
        # Log performance for Supabase queries (target: < 100ms p95)
        if query_time > 0.1:  # 100ms
            logger.warning(f"Query took {query_time:.3f}s (target: < 100ms)")
        else:
            logger.debug(f"Query completed in {query_time:.3f}s")
        
        return result

    def get_by_id(self, id: int) -> Optional[TodoItem]:
        """Get a TODO item by ID"""
        return self.db.query(TodoItem).filter(TodoItem.id == id).first()

    def create(self, description: str, priority: str = "Medium", due_date: Optional[datetime] = None, category: Optional[str] = None) -> TodoItem:
        """
        Create a new TODO item.
        """
        # Trim whitespace
        description = description.strip()

        # Validate not empty
        if not description:
            raise ValueError("Description cannot be empty or whitespace-only")

        # Validate length
        if len(description) > 500:
            raise ValueError("Description cannot exceed 500 characters")

        todo = TodoItem(
            description=description,
            completed=False,
            priority=priority,
            due_date=due_date,
            category=category
        )
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def update(
        self,
        id: int,
        description: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        due_date: Optional[datetime] = None,
        category: Optional[str] = None
    ) -> Optional[TodoItem]:
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

        # Update other fields if provided
        if completed is not None:
            todo.completed = completed
        if priority is not None:
            todo.priority = priority
        if due_date is not None:
            todo.due_date = due_date
        if category is not None:
            todo.category = category

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
