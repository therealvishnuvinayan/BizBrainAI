"""Migration configuration shares application settings and model metadata."""

from sqlalchemy.exc import SQLAlchemyError

from alembic import context
from bizbrain_api import models  # noqa: F401 -- register all mapped tables
from bizbrain_api.config import get_settings
from bizbrain_api.database import Base, DatabaseConfigurationError, get_engine

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    # Offline review needs no credentials and opens no database connection.
    context.configure(
        dialect_name="postgresql",
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = get_engine()
    try:
        with engine.connect() as connection:
            context.configure(
                connection=connection, target_metadata=target_metadata, compare_type=True
            )
            with context.begin_transaction():
                context.run_migrations()
    finally:
        engine.dispose()


try:
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        # Validate settings without putting a URL into Alembic's logging/configuration.
        get_settings().sqlalchemy_url()
        run_migrations_online()
except (SQLAlchemyError, DatabaseConfigurationError, ValueError):
    raise SystemExit(
        "Migration failed. Check backend configuration and schema privately."
    ) from None
