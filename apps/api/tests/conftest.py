from collections.abc import Iterator
from unittest.mock import Mock

import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from bizbrain_api.config import get_settings
from bizbrain_api.database import dispose_engine, get_session
from bizbrain_api.main import app


@pytest.fixture(autouse=True)
def isolate_database(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """No test may open a PostgreSQL connection, even if local credentials exist."""

    def forbidden_connection(*args: object, **kwargs: object) -> None:
        raise AssertionError("PostgreSQL access is forbidden in unit tests")

    monkeypatch.setattr(psycopg, "connect", forbidden_connection)
    monkeypatch.setenv(
        "DATABASE_URL", "postgresql+psycopg://unit:unit@invalid/neondb?sslmode=require"
    )
    get_settings.cache_clear()
    yield
    app.dependency_overrides.clear()
    dispose_engine()
    get_settings.cache_clear()


@pytest.fixture
def session() -> Mock:
    mock = Mock(spec=Session)
    mock.execute.return_value.scalar_one.return_value = 1
    mock.scalars.return_value = []
    mock.scalar.return_value = None
    return mock


@pytest.fixture
def client(session: Mock) -> Iterator[TestClient]:
    def override_session() -> Iterator[Mock]:
        yield session

    app.dependency_overrides[get_session] = override_session
    with TestClient(app) as test_client:
        yield test_client
