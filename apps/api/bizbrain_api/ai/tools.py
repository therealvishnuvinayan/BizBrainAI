"""The complete tool allowlist. No dynamic execution, SQL, or HTTP tools."""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from bizbrain_api import queries
from bizbrain_api.ai.schemas import (
    BusinessesResult,
    BusinessSummary,
    CountOrdersResult,
    ErrorCode,
    OrderFoundResult,
    OrderNotFoundResult,
    OrderSummary,
    ToolActivity,
    ToolFailure,
    ToolResult,
)
from bizbrain_api.database import DatabaseConfigurationError, get_engine
from bizbrain_api.models import Business, Order


class ToolArguments(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class ListBusinessesArguments(ToolArguments):
    limit: int = Field(ge=1, le=100)


class CountOrdersArguments(ToolArguments):
    pass


class GetOrderArguments(ToolArguments):
    business_slug: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)
    ]
    external_order_id: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)
    ]


ARGUMENT_MODELS = {
    "list_businesses": ListBusinessesArguments,
    "count_orders": CountOrdersArguments,
    "get_order_by_external_id": GetOrderArguments,
}

# Explicit Responses API function schemas; all properties are required in strict mode.
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "name": "list_businesses",
        "description": (
            "List stored businesses and slugs. Use to discover business context. "
            "Bounded; has_more indicates truncation."
        ),
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 100}},
            "required": ["limit"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "count_orders",
        "description": (
            "Count all orders currently stored across all businesses using PostgreSQL COUNT. "
            "No arguments."
        ),
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "get_order_by_external_id",
        "description": (
            "Look up an exact external order ID within a known business slug. Do not invent "
            "a slug. Returns typed missing-business or missing-order evidence. "
            "Does not determine delay causes."
        ),
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {
                "business_slug": {"type": "string", "minLength": 1, "maxLength": 255},
                "external_order_id": {"type": "string", "minLength": 1, "maxLength": 255},
            },
            "required": ["business_slug", "external_order_id"],
            "additionalProperties": False,
        },
    },
]

ERROR_MESSAGES: dict[ErrorCode, str] = {
    "unknown_tool": "The requested tool is not supported.",
    "invalid_arguments": "Tool arguments must match the tool's JSON schema.",
    "database_unavailable": "The database is unavailable; this is not a missing-record result.",
    "tool_timeout": "The database query timed out; no result was established.",
    "tool_failed": "The tool could not produce a verified result.",
    "tool_limit": "The five-tool execution limit was reached.",
    "round_limit": "No more tool calls are allowed in the final model round.",
}


def reject_tool(name: str, call_id: str, code: ErrorCode) -> tuple[ToolActivity, ToolFailure]:
    return (
        ToolActivity(
            call_id=call_id,
            tool=name if name in ARGUMENT_MODELS else "unsupported_tool",
            status="rejected",
            executed=False,
            error_code=code,
        ),
        ToolFailure(code=code, message=ERROR_MESSAGES[code]),
    )


def list_businesses(session: Session, arguments: ListBusinessesArguments) -> BusinessesResult:
    rows = queries.list_businesses(session, arguments.limit + 1)
    return BusinessesResult(
        businesses=[BusinessSummary.model_validate(row) for row in rows[: arguments.limit]],
        limit=arguments.limit,
        has_more=len(rows) > arguments.limit,
    )


def count_orders(session: Session, arguments: CountOrdersArguments) -> CountOrdersResult:
    count = session.execute(select(func.count()).select_from(Order)).scalar_one()
    return CountOrdersResult(count=count)


def get_order_by_external_id(
    session: Session, arguments: GetOrderArguments
) -> OrderFoundResult | OrderNotFoundResult:
    business_id = session.scalar(
        select(Business.id).where(Business.slug == arguments.business_slug)
    )
    if business_id is None:
        return OrderNotFoundResult(missing="business", **arguments.model_dump())
    order = session.scalar(
        select(Order).where(
            Order.business_id == business_id, Order.external_order_id == arguments.external_order_id
        )
    )
    if order is None:
        return OrderNotFoundResult(missing="order", **arguments.model_dump())
    return OrderFoundResult(
        business_slug=arguments.business_slug, order=OrderSummary.model_validate(order)
    )


def execute_tool(
    name: str, arguments_json: str, call_id: str
) -> tuple[ToolActivity, ToolResult | ToolFailure]:
    argument_model = ARGUMENT_MODELS.get(name)
    if argument_model is None:
        return reject_tool(name, call_id, "unknown_tool")
    if len(arguments_json) > 4096:
        return reject_tool(name, call_id, "invalid_arguments")
    try:
        arguments = argument_model.model_validate_json(arguments_json)
    except ValidationError:
        return reject_tool(name, call_id, "invalid_arguments")

    activity = ToolActivity(call_id=call_id, tool=name, status="succeeded", executed=True)
    try:
        # Each tool owns its transaction. Results are serialized before session cleanup.
        # SQL settings work with Neon's pooler; its startup `options` parameter does not.
        with Session(get_engine()) as session:
            session.execute(text("SET TRANSACTION READ ONLY"))
            session.execute(text("SET LOCAL statement_timeout = '5s'"))
            if isinstance(arguments, ListBusinessesArguments):
                result = list_businesses(session, arguments)
            elif isinstance(arguments, CountOrdersArguments):
                result = count_orders(session, arguments)
            else:
                result = get_order_by_external_id(session, arguments)
        if isinstance(result, OrderNotFoundResult):
            activity.status = "not_found"
        return activity, result
    except SQLAlchemyError as exc:
        code = (
            "tool_timeout"
            if getattr(getattr(exc, "orig", None), "sqlstate", None) == "57014"
            else "database_unavailable"
        )
    except DatabaseConfigurationError:
        code = "database_unavailable"
    except Exception:
        # Includes result validation errors. Neither exception messages nor arguments escape.
        code = "tool_failed"
    activity.status = "failed"
    activity.error_code = code
    return activity, ToolFailure(code=code, message=ERROR_MESSAGES[code])
