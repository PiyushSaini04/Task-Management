import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify backend service status.
    Returns status: ok.
    """
    return {"status": "ok"}


@router.get("/tasks",
            response_model=List[TaskResponse],
            status_code=status.HTTP_200_OK)
async def list_tasks(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all tasks from the database ordered by creation date descending.
    """
    query = select(Task).order_by(Task.created_at.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("/tasks", response_model=TaskResponse,
             status_code=status.HTTP_201_CREATED)
async def create_task(task_in: TaskCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new task. The default status is set to 'pending'.
    Returns the newly created task.
    """
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        category=task_in.category,
        due_date=task_in.due_date
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


@router.put("/tasks/{id}",
            response_model=TaskResponse,
            status_code=status.HTTP_200_OK)
async def update_task(
        id: uuid.UUID,
        task_in: TaskUpdate,
        db: AsyncSession = Depends(get_db)):
    """
    Update a task's title, description, or status by its ID.
    Returns the updated task model. Raises 404 if not found.
    """
    db_task = await db.get(Task, id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {id} not found"
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Delete a task by its ID.
    Returns 204 No Content on success. Raises 404 if not found.
    """
    db_task = await db.get(Task, id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {id} not found"
        )

    await db.delete(db_task)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
