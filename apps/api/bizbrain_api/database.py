"""Lazy engine creation and one synchronous session per request."""

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

from bizbrain_api.config import get_settings


class Base(DeclarativeBase):
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(table_name)s_%(column_0_name)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )


class DatabaseConfigurationError(RuntimeError):
    """Safe public error for missing or invalid database settings."""


@lru_cache
def get_engine() -> Engine:
    try:
        url = get_settings().sqlalchemy_url()
    except ValueError:
        raise DatabaseConfigurationError("Database configuration unavailable.") from None
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=0,
        pool_timeout=10,
        pool_recycle=300,
        connect_args={"connect_timeout": 10},
        hide_parameters=True,
        echo=False,
    )


def get_session() -> Iterator[Session]:
    # Closing rolls back the read transaction and returns its connection to the pool.
    with Session(get_engine()) as session:
        yield session


def dispose_engine() -> None:
    if get_engine.cache_info().currsize:
        get_engine().dispose()
        get_engine.cache_clear()
