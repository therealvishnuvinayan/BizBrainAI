from io import StringIO

from alembic.config import Config

from alembic import command
from bizbrain_api.config import BACKEND_ROOT


def test_initial_migration_renders_without_database_or_business_inserts() -> None:
    output = StringIO()
    config = Config(str(BACKEND_ROOT / "alembic.ini"), output_buffer=output)
    command.upgrade(config, "head", sql=True)
    sql = output.getvalue()
    for table in ("businesses", "orders", "order_items"):
        assert f"CREATE TABLE {table}" in sql
        assert f"INSERT INTO {table}" not in sql
    assert "TIMESTAMP WITH TIME ZONE" in sql
    assert "UNIQUE (business_id, external_order_id)" in sql
    assert "CHECK (quantity > 0)" in sql
    assert "DROP TABLE" not in sql
