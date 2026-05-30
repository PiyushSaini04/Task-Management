from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
# Explicitly import to register with Base.metadata
from app.api.v1.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that handles startup and shutdown tasks.
    Creates database tables if they do not exist.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Containerized Task Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware using dynamic settings.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API version router and include task endpoints
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(tasks_router, tags=["tasks"])

# Include versioned api router in the application
app.include_router(api_router)
