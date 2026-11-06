from unittest.mock import Mock

import pytest
from sqlalchemy.orm import Session

from bizbrain_api import database
from bizbrain_api.config import Settings


@pytest.mark.parametrize("failure", [False, True])
def test_session_closes_on_success_and_failure(
    monkeypatch: pytest.MonkeyPatch, failure: bool
) -> None:
    # A real unbound session exercises cleanup without connecting anywhere.
    session = Session()
    close = Mock(wraps=session.close)
    monkeypatch.setattr(session, "close", close)
    monkeypatch.setattr(database, "Session", lambda engine: session)
    dependency = database.get_session()
    assert next(dependency) is session
    if failure:
        with pytest.raises(RuntimeError, match="query failed"):
            dependency.throw(RuntimeError("query failed"))
    else:
        with pytest.raises(StopIteration):
            next(dependency)
    close.assert_called_once()


def test_missing_configuration_does_not_create_engine(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        database, "get_settings", lambda: Settings(_env_file=None, database_url=None)
    )
    with pytest.raises(database.DatabaseConfigurationError):
        database.get_engine()
