from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TodoItemCreate(BaseModel):
    """Schema for creating a TODO item"""

    description: str = Field(
        ..., min_length=1, max_length=500, description="TODO item description"
    )


class TodoItemUpdate(BaseModel):
    """Schema for updating a TODO item"""

    description: Optional[str] = Field(
        None, min_length=1, max_length=500, description="Updated description"
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
