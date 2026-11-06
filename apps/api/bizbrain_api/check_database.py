"""Read-only schema inspection and zero-record verification, never a seeder."""

import argparse

from sqlalchemy import func, inspect, select, text
from sqlalchemy.exc import SQLAlchemyError

from bizbrain_api.database import DatabaseConfigurationError, dispose_engine, get_engine
from bizbrain_api.models import Business, Order, OrderItem


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--require-empty", action="store_true")
    args = parser.parse_args()
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SET TRANSACTION READ ONLY"))
            connection.execute(text("SELECT 1"))
            inspector = inspect(connection)
            tables = inspector.get_table_names(schema="public")
            print("Database connectivity: OK")
            print("Public tables:", ", ".join(tables) or "(none)")
            all_empty = True
            for model in (Business, Order, OrderItem):
                name = model.__tablename__
                if name not in tables:
                    print(f"{name}: absent")
                    all_empty = False
                    continue
                columns = inspector.get_columns(name, schema="public")
                print(f"{name} columns:", ", ".join(c["name"] for c in columns))
                count = connection.scalar(select(func.count()).select_from(model))
                print(f"{name} records: {count}")
                all_empty = all_empty and count == 0
            if args.require_empty and not all_empty:
                print("Verification failed: all three tables must exist and contain zero records.")
                return 1
    except (SQLAlchemyError, DatabaseConfigurationError):
        print("Database check failed. Inspect backend configuration and connectivity privately.")
        return 1
    finally:
        dispose_engine()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
