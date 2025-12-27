import logging
import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime
from app.models import TodoItem

logger = logging.getLogger(__name__)


class TodoService:
    """Service layer for TODO item operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, completed: Optional[bool] = None, priority: Optional[str] = None, category: Optional[str] = None) -> List[TodoItem]:
        """Get all TODO items, with optional filters"""
        start_time = time.time()
        query = select(TodoItem)
        if completed is not None:
            query = query.filter(TodoItem.completed == completed)
        if priority is not None:
            query = query.filter(TodoItem.priority == priority)
        if category is not None:
            query = query.filter(TodoItem.category == category)
        query = query.order_by(TodoItem.created_at.desc())
        
        result = await self.db.execute(query)
        todos = result.scalars().all()
        
        query_time = time.time() - start_time
        
        # Log performance for Supabase queries (target: < 100ms p95)
        if query_time > 0.1:  # 100ms
            logger.warning(f"Query took {query_time:.3f}s (target: < 100ms)")
        else:
            logger.debug(f"Query completed in {query_time:.3f}s")
        
        return list(todos)

    async def get_by_id(self, id: int) -> Optional[TodoItem]:
        """Get a TODO item by ID"""
        result = await self.db.execute(
            select(TodoItem).filter(TodoItem.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, description: str, priority: str = "Medium", due_date: Optional[datetime] = None, category: Optional[str] = None) -> TodoItem:
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
        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def update(
        self,
        id: int,
        description: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        due_date: Optional[datetime] = None,
        category: Optional[str] = None
    ) -> Optional[TodoItem]:
        """Update a TODO item"""
        todo = await self.get_by_id(id)
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

        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def delete(self, id: int) -> bool:
        """Delete a TODO item"""
        todo = await self.get_by_id(id)
        if not todo:
            return False

        await self.db.delete(todo)
        await self.db.commit()
        return True

    async def toggle_complete(self, id: int) -> Optional[TodoItem]:
        """Toggle completion status of a TODO item"""
        todo = await self.get_by_id(id)
        if not todo:
            return None

        todo.completed = not todo.completed
        await self.db.commit()
        await self.db.refresh(todo)
        return todo
