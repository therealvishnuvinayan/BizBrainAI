from unittest.mock import Mock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from bizbrain_api.database import DatabaseConfigurationError, get_session
from bizbrain_api.main import app


def test_health_never_requests_database(client: TestClient, session: Mock) -> None:
    def forbidden_session() -> None:
        raise AssertionError("Health must not request a database session")

    app.dependency_overrides[get_session] = forbidden_session
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert not session.mock_calls


def test_readiness_success(client: TestClient, session: Mock) -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}
    assert str(session.execute.call_args.args[0]) == "SELECT 1"


def test_readiness_database_failure_is_sanitized(client: TestClient, session: Mock) -> None:
    session.execute.side_effect = OperationalError(
        "SELECT 1", {}, Exception("sensitive-host-and-password")
    )
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}
    assert "sensitive" not in response.text


def test_readiness_configuration_failure(client: TestClient) -> None:
    def unavailable_session() -> None:
        raise DatabaseConfigurationError("private configuration detail")

    app.dependency_overrides[get_session] = unavailable_session
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}


@pytest.mark.parametrize("path", ["/api/v1/businesses", "/api/v1/orders"])
def test_empty_listing_queries_database(client: TestClient, session: Mock, path: str) -> None:
    response = client.get(path)
    assert response.status_code == 200
    assert response.json() == []
    session.scalars.assert_called_once()
    statement = session.scalars.call_args.args[0]
    assert 50 in statement.compile().params.values()


@pytest.mark.parametrize("path", ["/api/v1/businesses", "/api/v1/orders"])
@pytest.mark.parametrize("limit", [0, -1, 101, "invalid"])
def test_listing_limit_is_bounded(
    client: TestClient, session: Mock, path: str, limit: int | str
) -> None:
    assert client.get(path, params={"limit": limit}).status_code == 422
    session.scalars.assert_not_called()


def test_custom_order_limit_reaches_query(client: TestClient, session: Mock) -> None:
    assert client.get("/api/v1/orders?limit=7").status_code == 200
    assert 7 in session.scalars.call_args.args[0].compile().params.values()


def test_invalid_uuid(client: TestClient, session: Mock) -> None:
    assert client.get("/api/v1/orders/not-a-uuid").status_code == 422
    session.scalar.assert_not_called()


def test_missing_order_uses_internal_uuid(client: TestClient, session: Mock) -> None:
    order_id = UUID(int=0)
    response = client.get(f"/api/v1/orders/{order_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Order not found"}
    statement = session.scalar.call_args.args[0]
    assert order_id in statement.compile().params.values()


@pytest.mark.parametrize("path", ["/api/v1/businesses", "/api/v1/orders"])
def test_listing_failure_is_not_disguised_as_empty(
    client: TestClient, session: Mock, path: str
) -> None:
    session.scalars.side_effect = OperationalError("query", {}, Exception("private detail"))
    response = client.get(path)
    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}


def test_no_business_write_routes(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths["/api/v1/ai/ask"]) == {"post"}
    assert all(
        set(methods) == {"get"} for path, methods in paths.items() if path != "/api/v1/ai/ask"
    )
