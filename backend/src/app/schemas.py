from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TodoItemCreate(BaseModel):
    """Schema for creating a TODO item"""

    description: str = Field(
        ..., min_length=1, max_length=500, description="TODO item description"
    )
    priority: str = Field("Medium", description="Priority level (Low, Medium, High)")
    due_date: Optional[datetime] = Field(None, description="Due date and time")
    category: Optional[str] = Field(None, description="Category label")


class TodoItemUpdate(BaseModel):
    """Schema for updating a TODO item"""

    description: Optional[str] = Field(
        None, min_length=1, max_length=500, description="Updated description"
    )
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, description="Updated priority")
    due_date: Optional[datetime] = Field(None, description="Updated due date")
    category: Optional[str] = Field(None, description="Updated category")


class TodoItemResponse(BaseModel):
    """Schema for TODO item response"""

    id: int
    description: str
    completed: bool
    priority: str
    due_date: Optional[datetime]
    category: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
