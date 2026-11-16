"""Offline Responses API objects shared by service and graph tests."""

import json

from openai.types.responses import Response, ResponseFunctionToolCall


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
