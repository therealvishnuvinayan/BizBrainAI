"""Typed tool results and the public AI response. Evidence is server-owned."""

from typing import Annotated, Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StringConstraints

NonemptyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
ToolName = Literal["list_businesses", "count_orders", "get_order_by_external_id"]
ErrorCode = Literal[
    "unknown_tool",
    "invalid_arguments",
    "database_unavailable",
    "tool_timeout",
    "tool_failed",
    "tool_limit",
    "round_limit",
]
AskStatus = Literal[
    "answered",
    "insufficient_evidence",
    "partial",
    "limit_exceeded",
    "unavailable",
    "error",
    "timeout",
]


class AskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: Annotated[NonemptyText, Field(max_length=2000)]


class BusinessSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    slug: str


class BusinessesResult(BaseModel):
    kind: Literal["businesses"] = "businesses"
    businesses: list[BusinessSummary]
    limit: int
    has_more: bool


class CountOrdersResult(BaseModel):
    kind: Literal["order_count"] = "order_count"
    count: int = Field(ge=0)


class OrderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    external_order_id: str
    status: str
    created_at: AwareDatetime
    promised_dispatch_at: AwareDatetime | None


class OrderFoundResult(BaseModel):
    kind: Literal["order_found"] = "order_found"
    business_slug: str
    order: OrderSummary


class OrderNotFoundResult(BaseModel):
    kind: Literal["order_not_found"] = "order_not_found"
    missing: Literal["business", "order"]
    business_slug: str
    external_order_id: str


class ToolFailure(BaseModel):
    kind: Literal["error"] = "error"
    code: ErrorCode
    message: str


ToolResult = Annotated[
    BusinessesResult | CountOrdersResult | OrderFoundResult | OrderNotFoundResult,
    Field(discriminator="kind"),
]


class ToolActivity(BaseModel):
    call_id: str
    tool: ToolName | Literal["unsupported_tool"]
    status: Literal["succeeded", "not_found", "failed", "rejected"]
    executed: bool
    error_code: ErrorCode | None = None


class Evidence(BaseModel):
    call_id: str
    tool: ToolName
    result: ToolResult


class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0


class AskResponse(BaseModel):
    answer: str
    status: AskStatus
    tool_activity: list[ToolActivity] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    usage: TokenUsage | None = None


class ModelAnswer(BaseModel):
    """The model writes prose and cites call IDs; it cannot author evidence objects."""

    model_config = ConfigDict(extra="forbid")
    answer: Annotated[NonemptyText, Field(max_length=6000)]
    status: Literal["answered", "insufficient_evidence"]
    evidence_call_ids: list[str] = Field(max_length=5)
    limitations: list[Annotated[NonemptyText, Field(max_length=500)]] = Field(max_length=10)
