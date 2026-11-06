import pytest

from bizbrain_api.config import Settings


def test_neon_url_uses_psycopg_and_hides_secret() -> None:
    raw = "postgresql://unit:private-token@invalid/neondb?sslmode=require"
    settings = Settings(_env_file=None, database_url=raw)
    url = settings.sqlalchemy_url()
    assert url.drivername == "postgresql+psycopg"
    assert url.database == "neondb"
    assert url.query["sslmode"] == "require"
    assert "private-token" not in repr(settings)
    assert "private-token" not in str(url)


@pytest.mark.parametrize(
    "url",
    [
        None,
        "not-a-url-private-token",
        "sqlite:///neondb",
        "postgresql://unit:private-token@invalid/wrong?sslmode=require",
        "postgresql://unit:private-token@invalid/neondb?sslmode=disable",
    ],
)
def test_invalid_configuration_has_safe_errors(url: str | None) -> None:
    settings = Settings(_env_file=None, database_url=url)
    with pytest.raises(ValueError) as error:
        settings.sqlalchemy_url()
    assert "private-token" not in str(error.value)
