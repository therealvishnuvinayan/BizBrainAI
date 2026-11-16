"""Typed graph state; provider items remain in their original JSON wire format."""

from dataclasses import dataclass, field
from typing import Any

from openai import OpenAI
from pydantic import BaseModel, Field

from bizbrain_api.ai.schemas import AskResponse, AskStatus


@dataclass(frozen=True)
class ModelContext:
    """Per-invocation dependencies, never placed in graph state or its updates."""

    client: OpenAI = field(repr=False)
    model: str


class PendingToolCall(BaseModel):
    call_id: str
    name: str
    arguments: str


class GraphError(BaseModel):
    """Only application-defined codes/messages, never raw exceptions or arguments."""

    code: str
    message: str
    call_id: str | None = None


class InvestigationState(AskResponse):
    """Public response fields plus private orchestration state.

    No reducers: every field uses LangGraph's replacement semantics. Nodes return
    JSON-compatible partial updates, explicitly copying lists they extend. Pydantic
    validates node inputs; SDK clients and sessions never enter this state.
    """

    question: str
    provider_items: list[dict[str, Any]] = Field(default_factory=list)
    pending_calls: list[PendingToolCall] = Field(default_factory=list)
    seen_call_ids: list[str] = Field(default_factory=list)
    model_rounds: int = Field(default=0, ge=0)
    tool_executions: int = Field(default=0, ge=0)
    output_text: str = ""
    errors: list[GraphError] = Field(default_factory=list)
    halted: bool = False
    answer: str = ""
    status: AskStatus = "insufficient_evidence"

    def to_response(self) -> AskResponse:
        """Copy only the unchanged public contract; internal state never reaches HTTP."""
        return AskResponse.model_validate(self.model_dump(include=set(AskResponse.model_fields)))
