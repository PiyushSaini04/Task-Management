from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.
    """
    DATABASE_URL: str = "postgresql+asyncpg://taskuser:taskpassword@db:5432/taskdb"
    CORS_ORIGINS: str = "*"

    @property
    def cors_origins_list(self) -> List[str]:
        """
        Parses the CORS_ORIGINS string into a list of origins.
        Supports '*' for all origins or comma-separated lists.
        """
        if not self.CORS_ORIGINS:
            return []
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
