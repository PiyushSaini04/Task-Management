from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Create async database engine.
# SQLAlchemy 2.0 async operations require an async driver like asyncpg.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# Create session maker configured for async database sessions
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy database models.
    """
    pass

async def get_db():
    """
    Dependency generator for database sessions.
    Yields an AsyncSession and closes it when the request is complete.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
