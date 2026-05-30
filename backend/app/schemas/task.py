import uuid
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

class TaskBase(BaseModel):
    """
    Base Pydantic schema for task properties.
    """
    title: str = Field(..., min_length=1, max_length=255, description="The title of the task")
    description: Optional[str] = Field(default=None, max_length=1000, description="Optional detailed description")
    status: Literal["pending", "completed"] = Field(default="pending", description="Task status")

    @field_validator("title")
    @classmethod
    def title_must_not_be_whitespace(cls, v: str) -> str:
        """
        Custom validator to ensure the title doesn't consist of only whitespace.
        """
        if not v.strip():
            raise ValueError("title must not be empty or contain only whitespace")
        return v.strip()

class TaskCreate(TaskBase):
    """
    Schema for creating a new task.
    """
    pass


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task. All fields are optional.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[Literal["pending", "completed"]] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_whitespace_if_provided(cls, v: Optional[str]) -> Optional[str]:
        """
        Ensures that if a title is updated, it's not empty or just whitespace.
        """
        if v is not None:
            if not v.strip():
                raise ValueError("title must not be empty or contain only whitespace")
            return v.strip()
        return v

class TaskResponse(BaseModel):
    """
    Schema for serialized task response.
    """
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: Literal["pending", "completed"]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
