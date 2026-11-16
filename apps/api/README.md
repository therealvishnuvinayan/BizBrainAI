# BizBrain AI API

A synchronous FastAPI backend with PostgreSQL read APIs and a bounded OpenAI Responses workflow orchestrated by LangGraph. **Work in progress:** verified offline; the Next.js demo remains independent. No business dataset, seed/import workflow, business-write endpoints, or production authentication is included.

## Setup

Python 3.12+ is required. From the repository root:

```sh
cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
```

For an existing environment created with `uv`, use `uv pip install --python .venv/bin/python -e '.[dev]'` instead. Runtime/development dependency ranges are in `pyproject.toml`; there is currently no Python lockfile. This checkpoint was tested with LangGraph 1.2.20 and OpenAI SDK 2.54.0.

Create the local configuration only if it does not already exist:

```sh
test -e .env || (umask 077; cp .env.example .env)
```

| Variable         | Purpose                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Backend-only PostgreSQL URL. Current validation requires database `neondb` and `sslmode=require`, `verify-ca`, or `verify-full`.    |
| `OPENAI_API_KEY` | Required only for AI requests; missing configuration returns a typed `503`.                                                         |
| `OPENAI_MODEL`   | Defaults to `gpt-6-luna`; the selected model must support the configured Responses tools, structured output, and reasoning options. |

Use `.env.example` as the credential-free template. PostgreSQL URLs using `postgres://` or `postgresql://` are normalized to `postgresql+psycopg://`. URL-encode credentials and retain the provider's TLS parameters. Settings load `apps/api/.env` regardless of the working directory; process environment variables take precedence. Existing local configuration should be preserved. Secrets use Pydantic `SecretStr` and must never be placed in frontend variables or source control.

```sh
uvicorn bizbrain_api.main:app --host 127.0.0.1 --port 8000 --reload
```

Open <http://127.0.0.1:8000/docs>. `/health` needs no database or API key. This is a localhost development service with no authentication or CORS configuration; it is not ready to expose real business data publicly.

## Database schema

The Alembic revision `0001` defines:

- `businesses`: UUID primary key, name, unique slug, timezone-aware creation timestamp.
- `orders`: UUID primary key, business foreign key, external ID, status, creation/promised-dispatch timestamps; unique `(business_id, external_order_id)`.
- `order_items`: UUID primary key, order foreign key, SKU, positive integer quantity.

The application does not create tables on startup or insert seed records. Request handlers use SELECT queries and close their sessions on success or failure; AI tools additionally enforce PostgreSQL read-only transactions. Alembic schema operations are separate from request handling.

Review SQL without connecting to a database:

```sh
alembic upgrade head --sql
alembic heads
```

For an explicitly selected development/test database, inspect existing tables with `python -m bizbrain_api.check_database` before applying `alembic upgrade head`. Then use `alembic current` and `alembic check` to inspect migration state. These commands access the configured database; migration commands can change its schema. Do not target production or blindly apply the initial migration over existing tables. Downgrade is intentionally disabled because it would drop tables. Offline SQL rendering does not prove a migration was applied.

## HTTP API

| Endpoint                        | Behavior                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /health`                   | Liveness: `200 {"status":"ok"}` without a connection.                                 |
| `GET /ready`                    | Runs `SELECT 1`; returns `200` or sanitized `503`. Does not verify schema currency.   |
| `GET /api/v1/businesses`        | Business list, ordered by creation time/UUID.                                         |
| `GET /api/v1/orders`            | Order list, newest first with UUID tie-breaking.                                      |
| `GET /api/v1/orders/{order_id}` | Internal UUID lookup with order items; `404` if missing, `422` for an invalid UUID.   |
| `POST /api/v1/ai/ask`           | Validated question, model-selected tools, evidence-linked answer or explicit failure. |

List endpoints accept `limit` from 1–100, default 50. They return `[]` for actual empty results; database failures return `503`, never a fabricated empty list. Cursor pagination is not implemented.

AI input is `{"question":"How many orders are in our database?"}` with a nonblank question of at most 2,000 characters and no extra fields. The public response contains `answer`, `status`, `tool_activity`, `evidence`, `limitations`, and `usage`.

| AI status               | HTTP | Meaning                                                                                         |
| ----------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `answered`              | 200  | Structured model answer with citations to executed tool evidence.                               |
| `insufficient_evidence` | 200  | Missing context/records or no validated basis for an answer.                                    |
| `partial`               | 200  | Some evidence exists, but a tool failed or was rejected.                                        |
| `limit_exceeded`        | 200  | Model/tool budget exhausted.                                                                    |
| `unavailable`           | 503  | Missing model configuration, provider failure, or unavailable database without usable evidence. |
| `timeout`               | 504  | Model timeout, or database timeout without usable evidence.                                     |
| `error`                 | 502  | Incomplete/invalid model output or invalid tool-call identifiers.                               |

Invalid request bodies return `422`. Evidence and tool activity are constructed by the server. Internal graph state, raw provider exceptions, credentials, and reasoning continuation content are not part of the HTTP response. `usage` sums values reported by completed provider responses; missing usage is not estimated and is not a complete billing record.

## Tools and orchestration

| Allowed tool               | Arguments and result                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list_businesses`          | Required integer `limit` (1–100); returns name/slug summaries and `has_more`.                                                                          |
| `count_orders`             | Empty object; returns a database count across all businesses.                                                                                          |
| `get_order_by_external_id` | Required business slug and external order ID, each 1–255 characters; returns order status/timestamps or typed missing-business/missing-order evidence. |

Python validates names and strict arguments before opening a session. Queries bind lookup values as parameters; arbitrary SQL, code execution, and HTTP tools are unavailable. Each AI tool opens a short transaction, sets `READ ONLY` and a five-second statement timeout, serializes its result, and closes the session before another model request.

The compiled graph has four nodes: `initialize`, `model`, `tools`, and `validate`. Conditional edges loop from model to tools while budgets remain, route final output through validation, and terminate failures. Each invocation has fresh Pydantic state with replacement updates; SDK clients live in per-invocation context. No checkpointer or persistent store is configured.

All Responses output items, including encrypted reasoning continuation, are preserved. Tool outputs retain their original `call_id` and include it in the result envelope for citation. The final validator rejects nonexistent/rejected evidence IDs and suppresses findings when no database evidence was obtained. These are provenance checks, not a proof that every sentence is supported. Order status and timestamps cannot establish a delay's cause.

Limits: **3 model attempts**, **5 executed tools**, **2,048 output tokens per model request**, **20-second SDK network timeout**, and **zero SDK/node retries**. The final model round disables tools; excess calls are rejected. Database failures consume a tool attempt; invalid names/arguments do not execute. The graph recursion limit is 10. Connection/statement limits apply separately and do not guarantee a total HTTP deadline. Multiple model-requested tools execute sequentially and may observe different database snapshots.

Questions and selected tool results are sent to OpenAI for live requests. `store=False` is set; this is not a claim that all provider retention is disabled. No application request/response logging or tracing integration is configured.

## Tests and verification

From `apps/api`, with its environment active:

```sh
ruff check .
ruff format --check .
pytest
python -m bizbrain_api.ai.graph  # Prints the actual graph as Mermaid text, offline.
```

On **16 November 2026**, Ruff lint/format and **105 offline tests** passed, including **18 graph cases**. The generated OpenAPI document matches the previously published contract. Existing evidence validation behavior is unchanged.

The test suite blocks real socket, HTTP, and Psycopg connections and substitutes unreachable configuration. Fixtures are synthetic in-memory objects; no tables or business records are created. Tests exercise the real LangGraph scheduler, execution budgets, provider/tool failures, safe errors, citation validation, history preservation, statelessness, session cleanup, and PostgreSQL migration SQL rendering. A real SDK client uses `httpx.MockTransport` to verify the Responses wire format without network access.

**Live verification remains pending.** The earlier manual-loop smoke attempt reached `count_orders` but its final answer failed citation validation. The handoff was corrected and is covered by an offline SDK regression; neither that fix nor the graph has a verified successful live end-to-end answer. No live database or OpenAI requests were made for this checkpoint.

The optional `python -m bizbrain_api.ai.smoke --live` command explicitly opts into one bounded, billable count question against the configured services. Use it only after selecting an approved development/test database and reviewing the local configuration. Normal tests never invoke a real live workflow. Database integration tests with a dedicated disposable database are still planned.

## Code map and resume point

- `ai/service.py`: SDK lifecycle and HTTP service boundary.
- `ai/graph.py`, `ai/state.py`: graph nodes, transitions, budgets, and typed state.
- `ai/tools.py`, `ai/schemas.py`: allowlist, argument/result contracts, read-only execution.
- `ai/validation.py`: evidence provenance and final-answer validation.
- `database.py`, `models.py`, `queries.py`, `routers/`: database lifecycle, schema, queries, endpoints.
- `tests/test_ai.py`, `tests/test_graph.py`: SDK handoff and graph regression scenarios.

Resume with `tests/test_ai.py::test_official_sdk_serializes_the_complete_protocol_without_network`, then validate the same citation handoff with the explicit live smoke command in an approved test environment. Frontend/API integration, authentication/tenant scoping, richer evidence tools, persistent conversations, and external integrations remain future work.
