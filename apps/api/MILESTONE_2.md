# Milestone 2: real LLM tool calling

`POST /api/v1/ai/ask` uses the official OpenAI Python SDK and Responses API.
The configured model selects tools; the server validates and executes only three
approved read-only Python functions. No keyword routing, simulated model answers,
LangGraph, additional migration, or business records are introduced.

## Setup

From `apps/api`, with the existing virtual environment:

```sh
source .venv/bin/activate
uv pip install --python .venv/bin/python -e '.[dev]'
uvicorn bizbrain_api.main:app --host 127.0.0.1 --port 8000 --reload
```

The one new runtime dependency is `openai>=2.54,<3` (verified with 2.54.0).
No migration command is needed. Keep the existing `DATABASE_URL` in the backend
`.env`; add the following locally if not already configured:

```dotenv
OPENAI_API_KEY=YOUR_PRIVATE_KEY
OPENAI_MODEL=gpt-6-luna
```

The implementation preserves existing environment files. Keys use Pydantic
`SecretStr`; they never enter browser code, tool results, logs, or API responses.
The SDK client explicitly targets `https://api.openai.com/v1`, has a 20-second
network timeout, and disables automatic retries. Missing OpenAI configuration
does not prevent `/health` or the existing business/order APIs from working.

This API remains a localhost learning service without authentication. Questions
and the selected tool results are sent to OpenAI; credentials and internal UUIDs
are not included in those results. `store=False` is set for Responses. This setting
is not a claim that every form of provider retention is disabled.

## Modules to review

| File | Purpose |
| --- | --- |
| `bizbrain_api/ai/client.py` | Small SDK client factory; context-manager cleanup |
| `bizbrain_api/ai/schemas.py` | Public request/response, typed tool results, model answer contract |
| `bizbrain_api/ai/tools.py` | Explicit strict JSON schemas, Pydantic argument validation, fixed SQLAlchemy queries |
| `bizbrain_api/ai/service.py` | Model/tool loop, budgets, history continuation, provenance checks, safe failures |
| `bizbrain_api/ai/smoke.py` | Explicitly invoked, bounded live count question |
| `bizbrain_api/routers/ai.py` | Synchronous POST route and typed HTTP error responses |
| `tests/test_ai.py` | Fake-model scenarios and real SDK serialization with an in-memory HTTP transport |

Also changed: `config.py`, `main.py`, `pyproject.toml`, `.env.example`, this guide,
`README.md`, `tests/conftest.py`, and the existing route-scope assertion in
`tests/test_api.py`. `ai/__init__.py` defines the new package. The database models,
session manager, migration history, and frontend source remain unchanged.

## Complete flow

1. Pydantic validates a nonblank question of at most 2,000 characters.
2. A synchronous SDK client sends the question, instructions, and three explicit
   function schemas using `client.responses.create`. The first round requires a
   tool; the model chooses which one. There is no keyword-based selection.
3. The server checks response completion, then examines actual `function_call`
   items. All response items, including reasoning continuation items, remain in
   conversation history. `reasoning.encrypted_content` is requested for stateless
   continuation with `store=False`.
4. Each requested name must be on the allowlist. Pydantic validates the JSON
   arguments with strict types and forbidden extra fields before any connection
   is opened. Unknown names and invalid arguments produce sanitized tool errors.
5. Each valid tool opens its own SQLAlchemy session, sets the transaction to
   **read only**, and sets a transaction-local five-second statement timeout.
   SQLAlchemy binds lookup arguments as parameters. No arbitrary SQL, Python, or
   HTTP execution is exposed to the model.
6. The tool materializes a typed result and closes its session, rolling back the
   read transaction. No session remains open during the next model request.
7. A `function_call_output` item goes into history with the original `call_id`.
   Its JSON content also contains that ID explicitly so the model can cite it:

   ```json
   {
     "type": "function_call_output",
     "call_id": "call_example",
     "output": "{\"call_id\":\"call_example\",\"result\":{\"kind\":\"order_count\",\"count\":0}}"
   }
   ```

8. The next Responses call receives the complete history and actual outputs.
   Multiple function calls in one response are supported and executed sequentially.
9. The model returns structured answer text, a status, evidence call IDs, and
   limitations. The server validates that cited IDs correspond to actual successful
   or typed not-found tool results. It creates `evidence` and `tool_activity` itself;
   the model cannot generate those records or invent source URLs for them.
10. The endpoint returns a typed `AskResponse`. If no database evidence was obtained,
    the server suppresses generated findings and returns an explicit failure or
    insufficient-evidence response. These fallback messages report failure; they
    never pretend to be a successful model answer.

## Tool contracts and budgets

| Tool | Arguments | Database operation/result |
| --- | --- | --- |
| `list_businesses` | Required integer `limit`, 1–100 | Fetches at most limit + 1 rows, returns name/slug plus `has_more`; empty is a genuine query result |
| `count_orders` | `{}` | `SELECT COUNT(*) FROM orders`; count spans all businesses |
| `get_order_by_external_id` | Required nonblank `business_slug` and `external_order_id`, each ≤255 characters | Resolves the business, then looks up the exact external ID within it; returns `order_found` or `order_not_found` with `missing: business/order` |

Order results include external ID, status, creation time, and promised dispatch
time. They omit items, internal IDs, and unrelated fields. Missing business/order
results are evidence of a completed lookup; a database outage is a tool error,
never an empty or missing-record result.

There are at most **three model requests**, **five Python tool execution attempts**,
and **2,048 output tokens per model request**. Database failures consume a tool
attempt; rejected names/arguments do not execute a handler. Round three disables
tools so the model can finish. Calls exceeding the tool budget receive matching
error outputs; a model that requests tools in the final round is stopped without
executing them. SDK retries are disabled. Timeouts apply to individual network,
connection, and statement operations, not a strict total HTTP deadline.

## API example

```sh
curl -X POST http://127.0.0.1:8000/api/v1/ai/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How many orders are in our database?"}'
```

Illustrative successful response shape, **not a claimed live run**. The real answer,
call ID, usage, and count come from that request:

```json
{
  "answer": "There are 0 orders in the database.",
  "status": "answered",
  "tool_activity": [
    {
      "call_id": "call_example",
      "tool": "count_orders",
      "status": "succeeded",
      "executed": true,
      "error_code": null
    }
  ],
  "evidence": [
    {
      "call_id": "call_example",
      "tool": "count_orders",
      "result": {"kind": "order_count", "count": 0}
    }
  ],
  "limitations": [],
  "usage": null
}
```

`usage` contains actual summed `input_tokens`, `output_tokens`, and `total_tokens`
from Responses usage objects, or `null` when none was returned. It is never
estimated. These totals cover only returned usage; a failed/timed-out API request
may not provide billing information.

| Status | HTTP | Meaning |
| --- | --- | --- |
| `answered` | 200 | Valid model answer linked to executed tool evidence |
| `insufficient_evidence` | 200 | Missing records/context, or no validated basis for generated findings |
| `partial` | 200 | Some evidence exists, but at least one tool failed or was rejected |
| `limit_exceeded` | 200 | A tool/model budget prevented completion of all requested work |
| `unavailable` | 503 | Missing model configuration, model failure, or database unavailable with no usable evidence |
| `timeout` | 504 | Model timeout, or database timeout with no usable evidence |
| `error` | 502 | Incomplete/malformed model answer or invalid tool-call identifiers |

Invalid request bodies return FastAPI's normal 422 validation response. Traces
contain IDs, allowlisted tool names, execution flags, outcomes, and safe error codes.
They omit raw arguments, provider exceptions, credentials, and reasoning content.

## Tests and live verification

```sh
ruff check .
ruff format --check .
pytest
python -c 'from bizbrain_api.main import app; print(app.title)'
```

Normal Pytest replaces credentials, blocks real PostgreSQL/HTTP connections, and
uses fake model responses. One test exercises the actual SDK through
`httpx.MockTransport`, checking the serialized protocol without network access.
No test seeds, creates, modifies, or deletes database records.

The optional smoke command is outside Pytest and refuses to run without `--live`:

```sh
python -m bizbrain_api.ai.smoke --live
```

It submits exactly one count question, under the budgets above, and may incur API
charges. It requires backend OpenAI and Neon credentials, prints only a sanitized
response, and exits nonzero if the model does not complete a grounded count answer.
To independently verify that the existing database remains empty:

```sh
python -m bizbrain_api.check_database --require-empty
```

### Verification recorded on 6 November 2026

- Ruff lint/format, Python import/OpenAPI checks, and frontend lint/typecheck passed.
- **87 tests passed**, including the original 39 tests. The existing upstream
  Starlette warning about moving TestClient from `httpx` to `httpx2` remains.
- Both before and after live execution, all three business tables contained zero
  rows. Database models, migration files, and frontend source were unchanged.
- One live `gpt-6-luna` workflow actually requested `count_orders`; Neon returned
  `0`. Its final answer failed the evidence-ID validation and was suppressed. This
  was a failed end-to-end smoke test, not a successful answer verification.
- The handoff was corrected to include `call_id` explicitly in tool-result JSON.
  A real-SDK/MockTransport regression test now verifies that the model can copy the
  identifier from that content. The correction has not yet been retested live;
  an additional bounded retry requires approval because the requested single live
  smoke invocation has already been used.
- Actual usage returned by that live attempt: **1,279 input, 52 output, 1,331 total
  tokens**. A sanitized execution trace is:

  ```text
  round 1: model requested count_orders({})
  Python: approved tool executed; read-only Neon COUNT returned 0; session closed
  round 2: model returned final output; evidence-ID validation rejected it
  API result: insufficient_evidence; actual count evidence retained
  ```

- No secrets were found in changed/new Git-visible files. No business data was
  inserted or modified; no commits or pushes were made.

## Limitations and learning points

- Provenance validation checks that evidence came from executed tools and that
  cited IDs exist. It is **not a semantic proof of every sentence** in model prose.
  Instructions prohibit unsupported findings; this milestone does not add a second
  model judge or a root-cause verification system.
- The three tools cannot establish why an order was delayed. No inventory,
  fulfillment, sales, or causal evidence exists in this schema. A missing record
  is not evidence for a specific cause.
- A business slug must come from the question or business discovery. Ambiguous
  businesses require clarification; there is no persistent multi-turn chat state.
- Separate tools use separate read transactions, so concurrent external changes
  could produce observations from different snapshots. Business lists are bounded
  and expose truncation; there is no cursor pagination yet.
- Every question requires an initial tool, since this endpoint is specifically for
  database questions. It is not a general-purpose chat endpoint.

Read `tools.execute_tool` for allowlisting, validation, parameter binding, and
context-manager cleanup. Read `service.run_tool_loop` for bounded iteration,
Responses item types, `call_id` matching, and model/tool handoffs. Read
`service.finalize` for the distinction between model prose and server-owned
evidence. `client.create_client` demonstrates SDK lifecycle and retry/timeout
configuration; `tests/test_ai.py` demonstrates dependency substitution and protocol
tests without live services.

Official references consulted:
[function calling](https://developers.openai.com/api/docs/guides/function-calling),
[structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs),
[conversation state](https://developers.openai.com/api/docs/guides/conversation-state),
and [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).
