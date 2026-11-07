"""Backend-only configuration; secrets are never included in representations."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import ArgumentError

BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )

    database_url: SecretStr | None = None
    openai_api_key: SecretStr | None = None
    openai_model: str = Field(default="gpt-6-luna", min_length=1, max_length=100)

    def sqlalchemy_url(self) -> URL:
        if self.database_url is None:
            raise ValueError("DATABASE_URL is required for database operations.")
        try:
            url = make_url(self.database_url.get_secret_value())
        except (ArgumentError, ValueError):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL URL.") from None
        if url.drivername not in {"postgres", "postgresql", "postgresql+psycopg"}:
            raise ValueError("DATABASE_URL must use PostgreSQL with Psycopg 3.")
        if url.database != "neondb":
            raise ValueError("DATABASE_URL must select the existing neondb database.")
        if url.query.get("sslmode") not in {"require", "verify-ca", "verify-full"}:
            raise ValueError("DATABASE_URL must require TLS using sslmode.")
        return url.set(drivername="postgresql+psycopg")


@lru_cache
def get_settings() -> Settings:
    return Settings()
