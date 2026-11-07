import json
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock
from uuid import UUID

import httpx
import pytest
from fastapi.testclient import TestClient
from openai import APIConnectionError, APITimeoutError, AuthenticationError, OpenAI
from openai.types.responses import Response, ResponseFunctionToolCall, ResponseReasoningItem
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from bizbrain_api.ai import client as client_module
from bizbrain_api.ai import service, smoke, tools
from bizbrain_api.ai.schemas import (
    BusinessesResult,
    CountOrdersResult,
    OrderFoundResult,
    OrderNotFoundResult,
)
from bizbrain_api.config import Settings
from bizbrain_api.database import DatabaseConfigurationError


def call(
    name: str = "count_orders", arguments: str = "{}", call_id: str = "call_1"
) -> ResponseFunctionToolCall:
    return ResponseFunctionToolCall(
        type="function_call", name=name, arguments=arguments, call_id=call_id
    )


def model_response(
    *items: object,
    answer: str | None = None,
    citations: tuple[str, ...] = ("call_1",),
    answer_status: str = "answered",
    status: str = "completed",
    usage: bool = True,
) -> Response:
    output = list(items)
    if answer is not None:
        output.append(
            {
                "type": "message",
                "id": "msg_1",
                "role": "assistant",
                "status": "completed",
                "content": [
                    {
                        "type": "output_text",
                        "annotations": [],
                        "text": json.dumps(
                            {
                                "answer": answer,
                                "status": answer_status,
                                "evidence_call_ids": citations,
                                "limitations": [],
                            }
                        ),
                    }
                ],
            }
        )
    return Response(
        id="resp_unit",
        created_at=0,
        model="gpt-6-luna",
        object="response",
        output=output,
        parallel_tool_calls=True,
        tool_choice="auto",
        tools=[],
        status=status,
        usage={
            "input_tokens": 10,
            "output_tokens": 5,
            "total_tokens": 15,
            "input_tokens_details": {"cached_tokens": 0, "cache_write_tokens": 0},
            "output_tokens_details": {"reasoning_tokens": 2},
        }
        if usage
        else None,
    )


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


def test_count_flow_preserves_reasoning_outputs_call_ids_and_real_usage(
    fake_model, db_session
) -> None:
    reasoning = ResponseReasoningItem(
        id="rs_unit", type="reasoning", summary=[], encrypted_content="opaque-continuation"
    )
    client = fake_model(
        [
            model_response(reasoning, call()),
            model_response(answer="There are 0 orders in the database."),
        ]
    )
    result = service.ask_question("How many orders?")
    assert result.status == "answered"
    assert result.answer == "There are 0 orders in the database."
    assert result.evidence[0].result == CountOrdersResult(count=0)
    assert result.tool_activity[0].executed
    assert result.usage.model_dump() == {
        "input_tokens": 20,
        "output_tokens": 10,
        "total_tokens": 30,
    }
    first, second = [entry.kwargs for entry in client.responses.create.call_args_list]
    assert first["model"] == "gpt-6-luna"
    assert first["tool_choice"] == "required"
    assert first["store"] is False
    assert first["include"] == ["reasoning.encrypted_content"]
    assert first["max_output_tokens"] == 2048
    assert first["input"] == [{"role": "user", "content": "How many orders?"}]
    assert second["input"][1] == reasoning
    assert second["input"][2].type == "function_call"
    tool_output = second["input"][3]
    assert tool_output["type"] == "function_call_output"
    assert tool_output["call_id"] == "call_1"
    assert json.loads(tool_output["output"]) == {
        "call_id": "call_1",
        "result": {"kind": "order_count", "count": 0},
    }
    statements = [str(entry.args[0]) for entry in db_session.execute.call_args_list]
    assert statements[:2] == ["SET TRANSACTION READ ONLY", "SET LOCAL statement_timeout = '5s'"]
    assert "count(" in statements[2].lower() and "FROM orders" in statements[2]
    db_session.close.assert_called_once()
    client.__exit__.assert_called_once()


def test_multiple_tools_in_one_response(fake_model, db_session) -> None:
    client = fake_model(
        [
            model_response(call(), call("list_businesses", '{"limit":10}', "call_2")),
            model_response(
                answer="There are 0 orders and no stored businesses.",
                citations=("call_1", "call_2"),
            ),
        ]
    )
    result = service.ask_question("List businesses and count orders")
    assert result.status == "answered"
    assert len(result.evidence) == 2
    assert result.evidence[1].result == BusinessesResult(businesses=[], limit=10, has_more=False)
    outputs = [
        item
        for item in client.responses.create.call_args.kwargs["input"]
        if isinstance(item, dict) and item.get("type") == "function_call_output"
    ]
    assert [item["call_id"] for item in outputs] == ["call_1", "call_2"]
    assert db_session.close.call_count == 2


@pytest.mark.parametrize(
    "arguments",
    [
        "not json",
        "[]",
        '{"limit":0}',
        '{"limit":101}',
        '{"limit":"5"}',
        '{"limit":true}',
        '{"limit":2,"sql":"DELETE"}',
        "{}",
        "x" * 4097,
    ],
)
def test_invalid_arguments_never_open_a_session(db_session, arguments) -> None:
    activity, result = tools.execute_tool("list_businesses", arguments, "call_1")
    assert result.code == "invalid_arguments"
    assert not activity.executed
    db_session.execute.assert_not_called()


@pytest.mark.parametrize(
    "arguments",
    [
        "{}",
        '{"business_slug":" ","external_order_id":"4821"}',
        '{"business_slug":"x","external_order_id":4821}',
    ],
)
def test_lookup_arguments_require_nonempty_strings(db_session, arguments) -> None:
    activity, result = tools.execute_tool("get_order_by_external_id", arguments, "call_1")
    assert result.code == "invalid_arguments"
    assert not activity.executed
    db_session.execute.assert_not_called()


def test_unknown_tool_never_dispatches_or_echoes_its_name(fake_model, db_session) -> None:
    client = fake_model(
        [
            model_response(call("execute_secret_sql", '{"sql":"DROP TABLE orders"}')),
            model_response(answer="I deleted the orders."),
        ]
    )
    result = service.ask_question("Do something unsupported")
    assert result.status == "insufficient_evidence"
    assert result.evidence == []
    assert result.tool_activity[0].tool == "unsupported_tool"
    assert result.tool_activity[0].executed is False
    assert "deleted" not in result.answer
    assert "execute_secret_sql" not in result.model_dump_json()
    tool_output = json.loads(client.responses.create.call_args.kwargs["input"][-1]["output"])
    assert tool_output["result"]["code"] == "unknown_tool"
    db_session.execute.assert_not_called()


def test_model_can_correct_invalid_arguments_on_next_round(fake_model) -> None:
    client = fake_model(
        [
            model_response(call(arguments='{"unexpected":true}')),
            model_response(call(call_id="call_2")),
            model_response(answer="The database has 0 orders.", citations=("call_2",)),
        ]
    )
    result = service.ask_question("Count orders")
    assert result.status == "partial"
    assert len(result.evidence) == 1
    assert result.tool_activity[0].error_code == "invalid_arguments"
    assert client.responses.create.call_args.kwargs["tool_choice"] == "none"


@pytest.mark.parametrize("missing_business", [True, False])
def test_typed_business_and_order_not_found(db_session, missing_business) -> None:
    db_session.scalar.side_effect = [None] if missing_business else [UUID(int=1), None]
    activity, result = tools.execute_tool(
        "get_order_by_external_id", '{"business_slug":"x","external_order_id":"4821"}', "call_1"
    )
    assert isinstance(result, OrderNotFoundResult)
    assert result.missing == ("business" if missing_business else "order")
    assert activity.status == "not_found"
    assert db_session.scalar.call_count == (1 if missing_business else 2)
    query = db_session.scalar.call_args.args[0].compile()
    if not missing_business:
        assert UUID(int=1) in query.params.values()
        assert "4821" in query.params.values()
        assert "business_id" in str(query)
    db_session.close.assert_called_once()


def test_lookup_serializes_only_needed_fields_before_session_closes(db_session) -> None:
    # In-memory ORM-shaped values only; no inserts, tables, or database fixtures.
    order = SimpleNamespace(
        external_order_id="4821",
        status="pending",
        created_at=datetime.now(UTC),
        promised_dispatch_at=None,
        id=UUID(int=1),
        business_id=UUID(int=1),
        private_note="not returned",
    )
    db_session.scalar.side_effect = [UUID(int=1), order]
    _, result = tools.execute_tool(
        "get_order_by_external_id", '{"business_slug":"x","external_order_id":"4821"}', "call_1"
    )
    assert isinstance(result, OrderFoundResult)
    assert "private_note" not in result.model_dump_json()
    assert "business_id" not in result.model_dump_json()
    assert db_session.info["active"] == 0


def test_business_query_is_bounded_and_reports_truncation(db_session) -> None:
    db_session.scalars.return_value = [
        SimpleNamespace(name="x", slug="x"),
        SimpleNamespace(name="y", slug="y"),
    ]
    _, result = tools.execute_tool("list_businesses", '{"limit":1}', "call_1")
    assert result.has_more is True
    assert len(result.businesses) == 1
    assert 2 in db_session.scalars.call_args.args[0].compile().params.values()


def test_empty_business_results_cannot_establish_order_delay(fake_model) -> None:
    fake_model(
        [
            model_response(call("list_businesses", '{"limit":50}')),
            model_response(
                answer="No businesses are stored, so I cannot establish why order 4821 is delayed.",
                answer_status="insufficient_evidence",
            ),
        ]
    )
    result = service.ask_question("Why is order #4821 delayed?")
    assert result.status == "insufficient_evidence"
    assert result.evidence[0].result.businesses == []
    assert "Never establish a root cause" in service.INSTRUCTIONS


def test_missing_order_retains_absence_evidence_and_limitation(fake_model) -> None:
    fake_model(
        [
            model_response(
                call("get_order_by_external_id", '{"business_slug":"x","external_order_id":"4821"}')
            ),
            model_response(
                answer="No matching business was found, so the order's delay cannot be explained.",
                answer_status="insufficient_evidence",
            ),
        ]
    )
    result = service.ask_question("Find order 4821 for business x")
    assert result.status == "insufficient_evidence"
    assert result.evidence[0].result.kind == "order_not_found"
    assert result.tool_activity[0].status == "not_found"
    assert result.limitations


def test_database_failure_is_not_missing_or_empty_and_closes_session(
    fake_model, db_session
) -> None:
    db_session.execute.side_effect = OperationalError(
        "query", {}, Exception("private-password-and-host")
    )
    client = fake_model([model_response(call()), model_response(answer="There are zero orders.")])
    result = service.ask_question("Count orders")
    assert result.status == "unavailable"
    assert result.evidence == []
    assert result.tool_activity[0].error_code == "database_unavailable"
    assert "zero" not in result.answer
    assert "private" not in result.model_dump_json()
    assert "database_unavailable" in client.responses.create.call_args.kwargs["input"][-1]["output"]
    db_session.close.assert_called_once()


def test_database_configuration_failure_is_sanitized(monkeypatch, db_session) -> None:
    def missing_engine():
        raise DatabaseConfigurationError("secret-config")

    monkeypatch.setattr(tools, "get_engine", missing_engine)
    activity, result = tools.execute_tool("count_orders", "{}", "call_1")
    assert activity.status == "failed"
    assert result.code == "database_unavailable"
    assert "secret" not in result.model_dump_json()


def test_query_timeout_and_unexpected_tool_errors_are_safe(db_session) -> None:
    original = Exception("private details")
    original.sqlstate = "57014"
    db_session.execute.side_effect = OperationalError("query", {}, original)
    _, result = tools.execute_tool("count_orders", "{}", "call_1")
    assert result.code == "tool_timeout"
    db_session.execute.side_effect = RuntimeError("private details")
    _, result = tools.execute_tool("count_orders", "{}", "call_2")
    assert result.code == "tool_failed"
    assert "private" not in result.model_dump_json()
    assert db_session.close.call_count == 2


@pytest.mark.parametrize("timeout", [False, True])
def test_model_failures_are_sanitized(fake_model, db_session, timeout) -> None:
    request = httpx.Request("POST", "https://api.openai.com/v1/responses")
    error = (
        APITimeoutError(request=request)
        if timeout
        else APIConnectionError(message="private-token", request=request)
    )
    client = fake_model([error])
    result = service.ask_question("Count orders")
    assert result.status == ("timeout" if timeout else "unavailable")
    assert "private-token" not in result.model_dump_json()
    assert result.usage is None
    client.responses.create.assert_called_once()
    db_session.execute.assert_not_called()


def test_model_failure_after_tools_preserves_evidence(fake_model) -> None:
    request = httpx.Request("POST", "https://api.openai.com/v1/responses")
    fake_model(
        [
            model_response(call()),
            AuthenticationError(
                "private-token", response=httpx.Response(401, request=request), body=None
            ),
        ]
    )
    result = service.ask_question("Count orders")
    assert result.status == "unavailable"
    assert result.evidence[0].result.count == 0
    assert result.usage.total_tokens == 15
    assert "private-token" not in result.model_dump_json()


def test_tool_limit_executes_at_most_five_and_returns_rejection_output(
    fake_model, db_session
) -> None:
    client = fake_model(
        [
            model_response(*(call(call_id=f"call_{i}") for i in range(6))),
            model_response(answer="The count queries returned 0.", citations=("call_0",)),
        ]
    )
    result = service.ask_question("Count orders")
    assert result.status == "limit_exceeded"
    assert len(result.evidence) == 5
    assert sum(activity.executed for activity in result.tool_activity) == 5
    assert result.tool_activity[-1].error_code == "tool_limit"
    assert db_session.close.call_count == 5
    assert client.responses.create.call_args.kwargs["tool_choice"] == "none"
    last_output = json.loads(client.responses.create.call_args.kwargs["input"][-1]["output"])
    assert last_output["result"]["code"] == "tool_limit"


def test_model_round_limit_reserves_final_round_for_answer(fake_model, db_session) -> None:
    client = fake_model([model_response(call(call_id=f"call_{i}")) for i in range(3)])
    result = service.ask_question("Count orders")
    assert result.status == "limit_exceeded"
    assert client.responses.create.call_count == 3
    assert client.responses.create.call_args.kwargs["tool_choice"] == "none"
    assert result.tool_activity[-1].executed is False
    assert result.tool_activity[-1].error_code == "round_limit"
    assert db_session.close.call_count == 2


@pytest.mark.parametrize("citations", [(), ("made_up_call",)])
def test_answer_with_invalid_provenance_is_not_returned(fake_model, citations) -> None:
    fake_model(
        [model_response(call()), model_response(answer="Invented finding", citations=citations)]
    )
    result = service.ask_question("Count orders")
    assert result.status == "insufficient_evidence"
    assert "Invented" not in result.answer
    assert len(result.evidence) == 1


def test_no_fabricated_answer_when_model_ignores_required_tools(fake_model) -> None:
    fake_model([model_response(answer="Order 4821 is delayed by a supplier shortage.")])
    result = service.ask_question("Why is order 4821 delayed?")
    assert result.evidence == []
    assert result.tool_activity == []
    assert result.status == "insufficient_evidence"
    assert "supplier" not in result.answer


def test_incomplete_model_output_is_not_executed(fake_model, db_session) -> None:
    fake_model([model_response(call(), status="incomplete")])
    result = service.ask_question("Count orders")
    assert result.status == "error"
    assert result.tool_activity == []
    db_session.execute.assert_not_called()


def test_duplicate_call_ids_do_not_execute_twice(fake_model, db_session) -> None:
    fake_model([model_response(call(), call())])
    result = service.ask_question("Count orders")
    assert result.status == "error"
    db_session.execute.assert_not_called()


def test_usage_absent_is_not_invented(fake_model) -> None:
    fake_model(
        [
            model_response(call(), usage=False),
            model_response(answer="There are 0 orders.", usage=False),
        ]
    )
    assert service.ask_question("Count orders").usage is None


def test_client_configuration_is_explicit_and_key_is_secret() -> None:
    with client_module.create_client() as client:
        assert client.max_retries == 0
        assert client.timeout == 20.0
        assert str(client.base_url) == "https://api.openai.com/v1/"
    settings = Settings(_env_file=None, openai_api_key="private-openai-key")
    assert "private-openai-key" not in repr(settings)


def test_missing_key_does_not_affect_health_or_query_database(
    client, monkeypatch, db_session
) -> None:
    monkeypatch.setattr(
        client_module, "get_settings", lambda: Settings(_env_file=None, openai_api_key=None)
    )
    response = client.post("/api/v1/ai/ask", json={"question": "Count orders"})
    assert response.status_code == 503
    assert response.json()["status"] == "unavailable"
    assert client.get("/health").status_code == 200
    db_session.execute.assert_not_called()


def test_ai_http_response(fake_model, client: TestClient) -> None:
    fake_model([model_response(call()), model_response(answer="There are 0 orders.")])
    response = client.post("/api/v1/ai/ask", json={"question": "How many orders?"})
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"answer", "status", "evidence", "tool_activity", "limitations", "usage"}
    assert body["evidence"][0]["result"]["count"] == 0


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"question": " "},
        {"question": "x" * 2001},
        {"question": 123},
        {"question": "Count orders", "sql": "SELECT 1"},
    ],
)
def test_invalid_http_requests_do_not_call_model(client, monkeypatch, body) -> None:
    create = Mock(side_effect=AssertionError("Model must not be called"))
    monkeypatch.setattr(service, "create_client", create)
    assert client.post("/api/v1/ai/ask", json=body).status_code == 422
    create.assert_not_called()


def test_explicit_tool_schemas_match_pydantic_required_arguments() -> None:
    for definition in tools.TOOL_DEFINITIONS:
        assert definition["type"] == "function"
        assert definition["strict"] is True
        params = definition["parameters"]
        assert params["additionalProperties"] is False
        assert set(params["required"]) == set(params["properties"])
        model = tools.ARGUMENT_MODELS[definition["name"]]
        assert set(params["properties"]) == set(model.model_fields)


def test_official_sdk_serializes_the_complete_protocol_without_network(db_session) -> None:
    requests = []

    def handle(request: httpx.Request) -> httpx.Response:
        assert db_session.info["active"] == 0
        requests.append(json.loads(request.content))
        if len(requests) == 1:
            reply = model_response(call(call_id="call_opaque_identifier"))
        else:
            # Regression: the model must see the opaque ID in textual tool content,
            # not just in protocol metadata, to cite real evidence reliably.
            envelope = json.loads(requests[-1]["input"][-1]["output"])
            reply = model_response(
                answer=f"There are {envelope['result']['count']} orders.",
                citations=(envelope["call_id"],),
            )
        return httpx.Response(200, json=reply.model_dump(mode="json"))

    with OpenAI(
        api_key="unit-key",
        max_retries=0,
        http_client=httpx.Client(transport=httpx.MockTransport(handle)),
    ) as client:
        result = service.run_tool_loop("Count orders", client, "gpt-6-luna")
    assert result.status == "answered"
    assert len(requests) == 2
    assert requests[1]["input"][-1]["call_id"] == "call_opaque_identifier"
    assert requests[0]["text"]["format"]["strict"] is True
    assert requests[0]["tools"][0]["type"] == "function"


def test_live_smoke_requires_explicit_opt_in(monkeypatch) -> None:
    monkeypatch.setattr("sys.argv", ["smoke"])
    ask = Mock(side_effect=AssertionError("A live workflow must not start"))
    monkeypatch.setattr(smoke, "ask_question", ask)
    with pytest.raises(SystemExit) as error:
        smoke.main()
    assert error.value.code == 2
    ask.assert_not_called()


def test_live_smoke_fails_safely_without_key(monkeypatch) -> None:
    monkeypatch.setattr("sys.argv", ["smoke", "--live"])
    monkeypatch.setattr(
        smoke, "get_settings", lambda: Settings(_env_file=None, openai_api_key=None)
    )
    ask = Mock(side_effect=AssertionError("A live workflow must not start"))
    monkeypatch.setattr(smoke, "ask_question", ask)
    assert smoke.main() == 2
    ask.assert_not_called()
