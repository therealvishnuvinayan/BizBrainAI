# BizBrain AI — Backend milestone 1

A small synchronous FastAPI API backed by the existing Neon PostgreSQL `neondb`
database. This milestone creates a schema only: **no business records, seeds,
imports, write endpoints, or AI integrations**. The Next.js mock dashboard remains
independent of this API.

## Module map

```text
apps/api/
├── pyproject.toml                 # Runtime and development dependencies
├── .env.example                   # Credential-free configuration template
├── alembic.ini
├── alembic/
│   ├── env.py                     # Settings + SQLAlchemy metadata
│   ├── script.py.mako             # Future revision template
│   └── versions/0001_initial_tables.py
├── bizbrain_api/
│   ├── main.py                    # App, lifespan cleanup, safe DB errors
│   ├── config.py                  # Pydantic Settings and secret URL handling
│   ├── database.py                # Declarative base, engine, session dependency
│   ├── models.py                  # Three typed SQLAlchemy models
│   ├── schemas.py                 # Pydantic response contracts
│   ├── queries.py                 # SELECT-only database queries
│   ├── check_database.py          # Read-only inspection and zero-row checks
│   └── routers/                   # Health, businesses, orders
└── tests/                         # Isolated API/config/schema/session/migration tests
```

## Install and configure

From the repository root (Python 3.12 recommended):

```sh
cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
```

Alternatively, with `uv` installed:

```sh
cd apps/api
uv venv --python python3.12
uv pip install --python .venv/bin/python -e '.[dev]'
source .venv/bin/activate
```

Only if `.env` does not already exist, copy the template:

```sh
test -e .env || (umask 077; cp .env.example .env)
```

Edit the **backend** `.env` locally with the connection URL for the existing Neon
project and `neondb`. Do not paste the secret into source code, logs, commands, or
chat. Do not create another project/database. `.env` files are ignored by Git.

```dotenv
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
```

Keep any additional Neon connection parameters. URL-encode special characters in
credentials. Plain `postgresql://` and `postgres://` URLs from Neon are normalized
to `postgresql+psycopg://` internally. TLS is required (`require`, `verify-ca`, or
`verify-full`). Pydantic wraps the value in `SecretStr`; never explicitly print its
unwrapped value. Process environment variables take precedence over `.env`.
The `.env` path is relative to this backend, independent of the shell's directory.

During initial setup, an existing `src/apps/api/.env` was copied to
`apps/api/.env` with private permissions. The original file was preserved; future
backend configuration changes belong in **`apps/api/.env`**.

Do not put this URL into a `NEXT_PUBLIC_` variable or any browser code. No CORS
middleware is enabled. This unauthenticated development API should stay bound to
localhost.

## Inspect, review, and migrate

Run these commands from `apps/api` with the virtual environment active:

```sh
# Read-only connection check and existing public table/column inventory.
python -m bizbrain_api.check_database

# Review the migration file and its PostgreSQL SQL without connecting.
alembic upgrade head --sql
alembic heads
```

If any of `businesses`, `orders`, or `order_items` already exist without this
migration's tracking metadata, stop and reconcile their schema first. Do not drop
them, automatically stamp them, or attempt to recreate them. Review existing
Alembic history too if `alembic_version` is already present. The initial migration
creates only the three tables, their constraints/indexes, and Alembic's normal
version metadata. PostgreSQL runs the migration transactionally.

After confirming that the migration is appropriate for the inspected database:

```sh
alembic upgrade head
alembic current
alembic check
python -m bizbrain_api.check_database --require-empty
```

The final command succeeds only when all three business tables exist and each has
**zero rows**. It uses a read-only transaction. An Alembic version row is expected
and is not business data. The app never calls `Base.metadata.create_all()`.

Downgrade is intentionally disabled in this learning milestone because it would
drop the tables. No destructive migration or test is required. If connectivity
is unavailable, these commands remain the steps to perform once access returns;
offline SQL review alone does not mean the schema was applied.

## Start and use the API

```sh
uvicorn bizbrain_api.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive docs: <http://127.0.0.1:8000/docs>.

| Request | Behavior |
| --- | --- |
| `GET /health` | `200 {"status":"ok"}`; no database connection or configuration needed |
| `GET /ready` | Runs `SELECT 1`; `200 {"status":"ready"}` or a sanitized `503` |
| `GET /api/v1/businesses` | Reads PostgreSQL; `[]` when empty |
| `GET /api/v1/orders` | Reads PostgreSQL; `[]` when empty |
| `GET /api/v1/orders/{order_id}` | Internal UUID lookup, including items; `404` if absent, `422` for an invalid UUID |

Both list endpoints accept `?limit=50`, constrained to 1–100. Results have a
deterministic timestamp/UUID ordering. Cursor/offset pagination is a later task.
Database failures return `503 {"detail":"Database unavailable"}`, never a fake
empty list or connection details. `/ready` checks connectivity, not schema
currency; use Alembic and the inspection command for schema validation.

```sh
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/ready
curl http://127.0.0.1:8000/api/v1/businesses
curl 'http://127.0.0.1:8000/api/v1/orders?limit=20'
```

Blocking database work uses synchronous `def` route handlers. FastAPI runs them
in its worker thread pool. The shared SQLAlchemy engine is created lazily, with
connection pre-ping, a five-connection pool, a 10-second pool wait, and a 10-second
connection timeout. Connections are recycled after five minutes. These are
individual connection limits, not a query timeout or a
guaranteed total HTTP request deadline. Each request owns a session; its context
manager closes it and rolls back the read transaction even when an error occurs.
The engine is disposed at application shutdown. There are no commits or writes
in request handlers.

The existing Neon endpoint rejects the optional `options` startup parameter, so
the engine uses supported Psycopg connection arguments only.

## Models and constraints

- **Business:** UUID primary key, required name and unique slug, `TIMESTAMPTZ`
  creation time with a server-side `now()` default.
- **Order:** UUID primary key, required business foreign key, external ID and
  status; unique `(business_id, external_order_id)`; timezone-aware creation time
  and optional promised dispatch time. The composite unique index also supports
  lookups by its leading `business_id`; creation time has a separate index.
- **OrderItem:** UUID primary key, indexed order foreign key, required SKU, and
  integer quantity constrained by PostgreSQL to `quantity > 0`.

Relationships express business → orders → items without cascading deletes.
Unexpected lazy relationship queries raise errors; order detail explicitly loads
items with `selectinload`. Python's `uuid4` is a default for a future ORM insert,
not a command that inserts anything. Required typed columns are non-nullable;
`datetime | None` makes the promised timestamp nullable. Pydantic separately
validates response UUIDs, timezone-aware timestamps, string bounds, and positive
integer quantities. These are intentionally small learning models.

## Checks and test isolation

```sh
ruff check .
ruff format --check .
pytest
python -c 'from bizbrain_api.main import app; print(app.title)'
alembic upgrade head --sql
alembic check
python -m bizbrain_api.check_database --require-empty
```

Unit tests override the session dependency, replace the configured URL with an
unreachable test-only value, and block Psycopg connection attempts. They never
create tables or insert/delete records. Schema validation values exist only in
memory. Tests cover liveness, readiness success/failure, empty database query
results, bounded limits, invalid/missing UUIDs, sanitized errors, configuration,
Pydantic validation, session cleanup, and offline migration rendering.

There are no database-mutating integration tests in this milestone. The explicit
live checks above only inspect schema and count records. Future integration tests
must require a separately configured test database/branch and must never default
to `DATABASE_URL` or silently target the primary Neon database.

### Milestone verification — 4 November 2026

- Python 3.12.8; editable backend installation completed.
- Ruff lint and formatting checks passed.
- Pytest: **39 passed**. One upstream Starlette warning recommends migrating its
  TestClient dependency from `httpx` to `httpx2`; it does not affect these results.
- Python import and actual localhost Uvicorn startup passed.
- Reviewed offline migration SQL, then applied revision **`0001`** after observing
  an empty public schema. `alembic current` reports `0001 (head)` and `alembic check`
  reports no new upgrade operations.
- Neon checks confirmed `businesses = 0`, `orders = 0`, and `order_items = 0`.
- Live HTTP checks against Neon passed: health/readiness `200`, both lists `200 []`,
  missing order `404`, invalid UUID `422`. The temporary API process was stopped.
- Existing frontend `npm run lint` and `npm run typecheck` passed.
- Existing environment contents were preserved, the backend `.env` has `0600`
  permissions, and neither environment file nor the virtual environment is
  Git-visible. No configured URL/password appears in new Git-visible files.
- No business records were created, no commits/pushes were made, and no milestone
  work remains blocked.

## Five Python concepts to learn first

1. **Packages and imports:** `bizbrain_api` is a package; editable installation
   makes absolute imports consistent in Uvicorn, Alembic, and Pytest.
2. **Type hints and `None`:** `Mapped[UUID]`, `list[Order]`, and `datetime | None`
   describe different values. SQLAlchemy and Pydantic use annotations to build
   database mappings and validation contracts; hints alone do not validate Python.
3. **Classes with different responsibilities:** SQLAlchemy model classes map
   tables, Pydantic classes validate API data, and Settings loads configuration.
4. **Generators and context managers:** `yield` lends a session to the request;
   `with` guarantees cleanup on normal completion and exceptions.
5. **Dependency injection and exceptions:** `Depends(get_session)` supplies each
   route's session and lets tests replace it. Exceptions unwind cleanup scopes;
   HTTP handlers turn expected failures into safe status codes.

Reference documentation: [SQLAlchemy engine configuration](https://docs.sqlalchemy.org/en/20/core/engines.html),
[Alembic offline migrations](https://alembic.sqlalchemy.org/en/latest/offline.html),
and [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/).
