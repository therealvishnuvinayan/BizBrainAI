from collections.abc import Iterator
from unittest.mock import Mock

import httpx
import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from bizbrain_api.config import get_settings
from bizbrain_api.database import dispose_engine, get_session
from bizbrain_api.main import app


@pytest.fixture(autouse=True)
def isolate_database(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Unit tests cannot use real PostgreSQL or HTTP connections."""

    def forbidden_connection(*args: object, **kwargs: object) -> None:
        raise AssertionError("Real network access is forbidden in unit tests")

    monkeypatch.setattr(psycopg, "connect", forbidden_connection)
    # Block real HTTP sockets without interfering with TestClient's in-memory transport.
    monkeypatch.setattr(httpx.HTTPTransport, "handle_request", forbidden_connection)
    monkeypatch.setenv("OPENAI_API_KEY", "unit-test-key-not-a-real-secret")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-6-luna")
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
