"""Graph behavior with real LangGraph scheduling and offline model/database dependencies."""

import json
from unittest.mock import Mock

import httpx
import pytest
from ai_helpers import call, model_response
from langgraph.graph import END
from langgraph.runtime import Runtime
from openai import APIConnectionError, APITimeoutError
from openai.types.responses import ResponseReasoningItem
from sqlalchemy.exc import OperationalError

from bizbrain_api.ai import graph, validation
from bizbrain_api.ai.schemas import AskResponse
from bizbrain_api.ai.state import InvestigationState, ModelContext


def observe(client, question="Count orders"):
    """Observe actual scheduling; this helper never chooses a graph transition."""
    events = list(
        graph.investigation_graph.stream(
            {"question": question},
            config={"recursion_limit": graph.GRAPH_RECURSION_LIMIT},
            context=ModelContext(client=client, model="gpt-6-luna"),
            stream_mode=["updates", "values"],
        )
    )
    nodes = [next(iter(data)) for mode, data in events if mode == "updates"]
    snapshots = [data for mode, data in events if mode == "values"]
    # Every observable value is ordinary JSON, including usage, evidence, and provider items.
    json.dumps(snapshots)
    state = InvestigationState.model_validate(snapshots[-1])
    return nodes, snapshots, state


def assert_no_writes(session):
    for name in ("add", "add_all", "delete", "commit", "flush", "bulk_insert_mappings"):
        getattr(session, name).assert_not_called()
    for entry in session.execute.call_args_list:
        sql = str(entry.args[0]).strip().upper()
        assert sql.startswith(
            ("SELECT ", "SET TRANSACTION READ ONLY", "SET LOCAL statement_timeout".upper())
        )


def test_graph_success_visits_validation_and_keeps_public_contract(
    fake_model, db_session, monkeypatch
):
    validate = Mock(wraps=validation.finalize)
    monkeypatch.setattr(graph, "finalize", validate)
    client = fake_model([model_response(call()), model_response(answer="There are 0 orders.")])
    nodes, snapshots, state = observe(client)
    assert nodes == ["initialize", "model", "tools", "model", "validate"]
    assert state.model_rounds == 2
    assert state.tool_executions == 1
    assert state.pending_calls == []
    assert state.to_response().status == "answered"
    assert state.evidence[0].call_id == state.tool_activity[0].call_id == "call_1"
    assert state.usage.total_tokens == 30
    assert set(state.to_response().model_dump()) == set(AskResponse.model_fields)
    assert [len(value["provider_items"]) for value in snapshots if "provider_items" in value] == [
        1,
        2,
        3,
        4,
        4,
    ]
    validate.assert_called_once()
    assert db_session.info["active"] == 0
    assert_no_writes(db_session)


def test_sequential_tool_rounds_preserve_history_without_reducers(fake_model, db_session):
    reasoning = ResponseReasoningItem(
        id="rs_opaque",
        type="reasoning",
        summary=[],
        encrypted_content="encrypted-continuation",
        provider_extension={"future_field": "preserve-this"},
    )
    client = fake_model(
        [
            model_response(reasoning, call("list_businesses", '{"limit":10}', "call_businesses")),
            model_response(call(call_id="call_count")),
            model_response(
                answer="There are no businesses and 0 orders.",
                citations=("call_businesses", "call_count"),
            ),
        ]
    )
    nodes, snapshots, state = observe(client)
    assert nodes == ["initialize", "model", "tools", "model", "tools", "model", "validate"]
    assert (state.model_rounds, state.tool_executions) == (3, 2)
    assert state.usage.total_tokens == 45
    assert [entry.kwargs["tool_choice"] for entry in client.responses.create.call_args_list] == [
        "required",
        "auto",
        "none",
    ]
    final_history = state.provider_items
    assert final_history.count(reasoning.model_dump(mode="json", exclude_none=True)) == 1
    assert [item["call_id"] for item in final_history if item.get("type") == "function_call"] == [
        "call_businesses",
        "call_count",
    ]
    assert [
        item["call_id"] for item in final_history if item.get("type") == "function_call_output"
    ] == ["call_businesses", "call_count"]
    assert snapshots[1]["provider_items"] == [{"role": "user", "content": "Count orders"}]
    assert len(snapshots[2]["provider_items"]) == 3  # Earlier snapshots were not mutated later.
    assert state.pending_calls == []
    assert db_session.close.call_count == 2
    assert_no_writes(db_session)


def test_tool_budget_is_cumulative_across_batches_and_still_allows_final_answer(
    fake_model, db_session
):
    client = fake_model(
        [
            model_response(*(call(call_id=f"call_{i}") for i in range(2))),
            model_response(*(call(call_id=f"call_{i}") for i in range(2, 6))),
            model_response(answer="The count is 0.", citations=("call_0",)),
        ]
    )
    nodes, _, state = observe(client)
    assert nodes[-2:] == ["model", "validate"]
    assert state.model_rounds == 3
    assert state.tool_executions == 5
    assert len(state.tool_activity) == 6
    assert len(state.evidence) == 5
    assert state.tool_activity[-1].error_code == "tool_limit"
    assert not state.tool_activity[-1].executed
    assert state.errors[-1].code == "tool_limit"
    assert state.status == "limit_exceeded"
    assert db_session.close.call_count == 5
    assert client.responses.create.call_args.kwargs["tool_choice"] == "none"
    assert_no_writes(db_session)


def test_final_round_tool_requests_terminate_without_execution(fake_model, db_session):
    client = fake_model([model_response(call(call_id=f"call_{i}")) for i in range(3)])
    nodes, _, state = observe(client)
    assert nodes == ["initialize", "model", "tools", "model", "tools", "model", "tools"]
    assert state.status == "limit_exceeded"
    assert state.halted
    assert state.model_rounds == 3 and state.tool_executions == 2
    assert state.errors[-1].code == "round_limit"
    assert len(state.evidence) == 2
    assert not state.tool_activity[-1].executed
    assert graph.after_tools(state) == "end"
    assert db_session.close.call_count == 2


@pytest.mark.parametrize(
    "name,arguments,code",
    [
        ("unknown_private_tool", "{}", "unknown_tool"),
        ("count_orders", '{"sql":"private-input"}', "invalid_arguments"),
    ],
)
def test_rejected_calls_return_safe_outputs_without_evidence(
    fake_model, db_session, name, arguments, code
):
    client = fake_model(
        [
            model_response(call(name, arguments)),
            model_response(answer="Unsupported finding"),
        ]
    )
    nodes, _, state = observe(client)
    assert nodes[-1] == "validate"
    assert state.errors[0].code == code
    assert state.tool_executions == 0 and state.evidence == []
    assert state.status == "insufficient_evidence"
    assert "Unsupported finding" not in state.answer
    assert "private" not in json.dumps([error.model_dump() for error in state.errors])
    db_session.execute.assert_not_called()


@pytest.mark.parametrize("timeout", [False, True])
@pytest.mark.parametrize("after_evidence", [False, True])
def test_model_errors_terminate_without_retry_and_preserve_evidence(
    fake_model, timeout, after_evidence
):
    request = httpx.Request("POST", "https://api.openai.com/v1/responses")
    error = (
        APITimeoutError(request=request)
        if timeout
        else APIConnectionError(request=request, message="private-key")
    )
    replies = [model_response(call()), error] if after_evidence else [error]
    client = fake_model(replies)
    nodes, _, state = observe(client)
    assert nodes[-1] == "model"
    assert "validate" not in nodes
    assert graph.after_model(state) == "end"
    assert state.model_rounds == len(replies) == client.responses.create.call_count
    assert state.status == ("timeout" if timeout else "unavailable")
    assert len(state.evidence) == int(after_evidence)
    assert state.usage.total_tokens == 15 if after_evidence else state.usage is None
    assert "private-key" not in state.model_dump_json()


def test_database_error_routes_to_validation_without_fabricating_empty_results(
    fake_model, db_session
):
    db_session.execute.side_effect = OperationalError("query", {}, Exception("private-host"))
    client = fake_model([model_response(call()), model_response(answer="There are zero orders.")])
    nodes, _, state = observe(client)
    assert nodes == ["initialize", "model", "tools", "model", "validate"]
    assert state.status == "unavailable"
    assert state.evidence == []
    assert state.errors[0].code == "database_unavailable"
    assert "zero" not in state.answer
    assert "private-host" not in state.model_dump_json()
    db_session.close.assert_called_once()


@pytest.mark.parametrize("citations", [(), ("invented_id",), ("rejected_call",)])
def test_final_answer_cannot_cite_nonexistent_or_rejected_evidence(fake_model, citations):
    client = fake_model(
        [
            model_response(call(), call("unsupported", "{}", "rejected_call")),
            model_response(answer="Unsupported finding", citations=citations),
        ]
    )
    nodes, _, state = observe(client)
    assert nodes[-1] == "validate"
    assert state.status == "insufficient_evidence"
    assert [item.call_id for item in state.evidence] == ["call_1"]
    assert "Unsupported finding" not in state.answer


def test_reused_call_id_stops_before_any_repeat_execution(fake_model, db_session):
    client = fake_model([model_response(call()), model_response(call())])
    nodes, _, state = observe(client)
    assert nodes == ["initialize", "model", "tools", "model"]
    assert state.status == "error"
    assert state.errors[-1].code == "invalid_call_ids"
    assert len(state.evidence) == state.tool_executions == 1
    db_session.close.assert_called_once()


def test_graph_is_stateless_and_context_credentials_never_enter_state(fake_model):
    for question in ("First question", "Second question"):
        client = fake_model([model_response(call()), model_response(answer="There are 0 orders.")])
        client.api_key = "private-context-key"
        _, snapshots, state = observe(client, question)
        assert state.question == question
        assert state.model_rounds == 2 and state.tool_executions == 1
        assert len(state.evidence) == 1 and state.seen_call_ids == ["call_1"]
        encoded = json.dumps(snapshots)
        assert "private-context-key" not in encoded
        assert "unit-test-key-not-a-real-secret" not in encoded
        assert "postgresql+psycopg" not in encoded
        assert "client=" not in repr(ModelContext(client=client, model="gpt-6-luna"))
    assert graph.investigation_graph.checkpointer is None
    assert graph.investigation_graph.store is None


def test_model_budget_guard_also_protects_direct_node_calls(fake_model):
    client = fake_model([])
    state = InvestigationState(question="Count orders", model_rounds=3)
    update = graph.call_model(
        state, Runtime(context=ModelContext(client=client, model="gpt-6-luna"))
    )
    assert update["status"] == "limit_exceeded"
    assert update["halted"]
    client.responses.create.assert_not_called()


def test_mermaid_export_matches_actual_conditional_topology(fake_model):
    client = fake_model([])
    drawable = graph.investigation_graph.get_graph()
    diagram = drawable.draw_mermaid()
    assert "graph TD" in diagram
    assert {"initialize", "model", "tools", "validate"}.issubset(drawable.nodes)
    conditional_edges = {(edge.source, edge.target) for edge in drawable.edges if edge.conditional}
    assert conditional_edges == {
        ("model", "tools"),
        ("model", "validate"),
        ("model", END),
        ("tools", "model"),
        ("tools", END),
    }
    client.responses.create.assert_not_called()
