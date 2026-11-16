# BizBrain AI

**An in-progress Applied AI engineering project for investigating business questions with inspectable evidence.** Built to explore how a useful business interface, typed database APIs, and bounded LLM tool calling fit together.

[Explore the frontend demo](https://bizbrainai.vercel.app) · [Backend setup and API reference](apps/api/README.md)

The hosted Next.js demo uses **synthetic local data and prepared investigations**. The FastAPI backend is implemented and tested separately; the frontend does not call it. Backend deployment and a successful live end-to-end AI answer are not verified.

## Implemented

- **Frontend demo:** responsive business dashboard, revenue/order charts, prepared order investigation, source-record dialogs, searchable sample records, and desktop/mobile navigation. Authentication controls are visibly disabled.
- **Read-only API:** FastAPI health/readiness endpoints, bounded business/order lists, and order detail by internal UUID. SQLAlchemy models and an Alembic migration define PostgreSQL businesses, orders, and order items, with Neon-compatible configuration.
- **LLM tool calling:** `POST /api/v1/ai/ask` uses the official OpenAI Responses API. The model selects from three server-side tools: `list_businesses`, `count_orders`, and `get_order_by_external_id`. Strict argument validation and fixed parameterized queries control execution.
- **LangGraph orchestration:** a stateless graph initializes a request, calls the model, executes tools, and validates the answer. It enforces three model attempts and five tool executions, preserves Responses continuation items, and returns server-owned evidence and tool activity. Verified with offline model/database substitutes and the real graph scheduler.
- **Failure handling:** missing records, database failures, provider errors, invalid citations, and exhausted budgets produce explicit outcomes. AI tools use read-only transactions and bounded query timeouts.

## Architecture

| Layer             | Stack                                                                                             | Current role                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Web — `src/`      | Next.js App Router, React, TypeScript, Tailwind CSS v4, adapted shadcn/Radix components, Recharts | Independent synthetic demo                                    |
| API — `apps/api/` | Python, FastAPI, Pydantic, OpenAI SDK, LangGraph                                                  | REST endpoints and bounded question → tools → answer workflow |
| Storage           | PostgreSQL/Neon, SQLAlchemy, Psycopg, Alembic                                                     | Relational schema and SELECT-only application queries         |

The model proposes tool calls; Python validates and executes them. The server constructs evidence from actual tool results and checks that answer citations reference those results. This verifies provenance, not the semantic truth of every sentence. No arbitrary SQL, Python, or HTTP tool is exposed to the model.

## Run the frontend

Use Node.js 20.9+; verification used Node 22.12.0.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000> and choose **Explore Demo Workspace**. No API keys, backend, or database are needed. The demo includes overview, investigations, connections, knowledge, history, and settings pages. Connection statuses and tool activity are simulated.

## Run the API

Use Python 3.12+; verification used Python 3.12.8.

```sh
cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
test -e .env || (umask 077; cp .env.example .env)
uvicorn bizbrain_api.main:app --host 127.0.0.1 --port 8000 --reload
```

`GET /health` and [interactive API docs](http://127.0.0.1:8000/docs) work without credentials. Configure the ignored `apps/api/.env` for database/model requests: `DATABASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. The current database configuration requires a database named `neondb` with TLS. See the [backend README](apps/api/README.md) for schema preparation, tool contracts, and status codes. Keep this unauthenticated development API bound to localhost.

## Tests and verification

```sh
# Repository root
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm run test:visual

# apps/api, with its virtual environment active
ruff check .
ruff format --check .
pytest
```

Verified on **16 November 2026**: frontend lint, TypeScript, and production build; backend Ruff lint/format and **105 offline tests**. Browser results: **25 passed, one intentional duplicate tablet check skipped**, plus **9 screenshot comparisons passed** across login, dashboard, and investigation at desktop/tablet/mobile sizes. Browser tests use installed Google Chrome and start a local production server after the build.

Backend tests block real sockets/HTTP/PostgreSQL connections, use in-memory fixtures, and exercise SDK serialization with `httpx.MockTransport`. They cover graph transitions, execution budgets, read-only dispatch, evidence validation, session cleanup, and the existing API contract. No live OpenAI calls, database queries, or migrations were performed for this checkpoint.

## Current limitations

- The web demo and API are not integrated. No production authentication, tenant isolation, external business connectors, imported business dataset, or seed workflow is implemented.
- The AI workflow is verified offline. A live end-to-end answer still needs validation; no deployed AI backend is claimed.
- Available tools can list businesses, count orders, and look up order status/timestamps. They cannot establish inventory risks, revenue explanations, or order-delay root causes.
- The graph has no persistent memory, checkpointing, human approval, RAG, or multi-agent workflow. Limits apply per operation, not as a total HTTP request deadline.

## Next steps

1. Resume at the citation-handoff regression in `apps/api/tests/test_ai.py`, then explicitly run the bounded live smoke check against an approved development/test database and verify the final answer cites executed evidence.
2. Add an isolated database integration-test environment before introducing fixture loading or write operations.
3. Connect one frontend investigation flow to the typed API, preserving clear demo/live boundaries; add authentication and tenant scoping before exposing business data publicly.
