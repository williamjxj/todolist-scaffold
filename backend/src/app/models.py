from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class TodoItem(Base):
    """SQLAlchemy model for TODO items"""

    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(String, default="Medium", nullable=False) # Low, Medium, High
    due_date = Column(DateTime, nullable=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<TodoItem(id={self.id}, description='{self.description[:20]}...', completed={self.completed})>"
