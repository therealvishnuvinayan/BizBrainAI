import socket
from collections.abc import Iterator
from contextlib import contextmanager
from unittest.mock import MagicMock, Mock

import httpx
import psycopg
import pytest
from fastapi.testclient import TestClient
from openai.types.responses import Response
from sqlalchemy.orm import Session

from bizbrain_api.ai import service, tools
from bizbrain_api.config import get_settings
from bizbrain_api.database import dispose_engine, get_session
from bizbrain_api.main import app


@pytest.fixture(autouse=True)
def isolate_database(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Unit tests cannot use real PostgreSQL or HTTP connections."""

    def forbidden_connection(*args: object, **kwargs: object) -> None:
        raise AssertionError("Real network access is forbidden in unit tests")

    monkeypatch.setattr(psycopg, "connect", forbidden_connection)
    monkeypatch.setattr(socket.socket, "connect", forbidden_connection)
    monkeypatch.setattr(socket.socket, "connect_ex", forbidden_connection)
    monkeypatch.setenv("LANGSMITH_TRACING", "false")
    monkeypatch.setenv("LANGCHAIN_TRACING_V2", "false")
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


@pytest.fixture
def db_session(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    session = MagicMock(spec=Session)
    session.info = {"active": 0}
    session.scalars.return_value = []
    session.scalar.return_value = None
    session.execute.return_value.scalar_one.return_value = 0

    @contextmanager
    def isolated_session(engine: object) -> Iterator[MagicMock]:
        session.info["active"] += 1
        try:
            yield session
        finally:
            session.close()
            session.info["active"] -= 1

    monkeypatch.setattr(tools, "get_engine", lambda: None)
    monkeypatch.setattr(tools, "Session", isolated_session)
    return session


@pytest.fixture
def fake_model(monkeypatch: pytest.MonkeyPatch, db_session: MagicMock):
    def make(responses: list[Response | Exception]) -> MagicMock:
        responses_iter = iter(responses)

        def respond(**kwargs: object) -> Response:
            assert db_session.info["active"] == 0, "Session held open during model request"
            value = next(responses_iter)
            if isinstance(value, Exception):
                raise value
            return value

        client = MagicMock()
        client.__enter__.return_value = client
        client.responses.create.side_effect = respond
        monkeypatch.setattr(service, "create_client", lambda: client)
        return client

    return make
