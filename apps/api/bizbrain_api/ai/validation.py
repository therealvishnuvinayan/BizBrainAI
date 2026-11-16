"""Existing answer and evidence validation, shared by graph nodes."""

from pydantic import ValidationError

from bizbrain_api.ai.schemas import (
    AskResponse,
    AskStatus,
    BusinessesResult,
    ModelAnswer,
    OrderFoundResult,
    OrderNotFoundResult,
)


def stop(result: AskResponse, status: AskStatus, message: str) -> AskResponse:
    """Safe, explicit failure response, never a simulated successful model answer."""
    result.status = status
    result.answer = message
    if message not in result.limitations:
        result.limitations.append(message)
    return result


def finalize(result: AskResponse, output_text: str) -> AskResponse:
    if not result.evidence:
        codes = {activity.error_code for activity in result.tool_activity}
        if "database_unavailable" in codes:
            return stop(
                result,
                "unavailable",
                "The database was unavailable. No database facts were established.",
            )
        if "tool_timeout" in codes:
            return stop(
                result,
                "timeout",
                "The database query timed out. No database facts were established.",
            )
        return stop(
            result,
            "insufficient_evidence",
            "No verified database evidence is available to answer this question.",
        )
    try:
        draft = ModelAnswer.model_validate_json(output_text)
    except ValidationError:
        return stop(result, "error", "The model did not return a valid grounded answer.")
    actual_ids = {evidence.call_id for evidence in result.evidence}
    if not draft.evidence_call_ids or not set(draft.evidence_call_ids).issubset(actual_ids):
        return stop(
            result,
            "insufficient_evidence",
            "The model's answer could not be tied to executed database tools.",
        )

    result.answer = draft.answer
    result.status = draft.status
    result.limitations.extend(draft.limitations)
    for evidence in result.evidence:
        data = evidence.result
        if isinstance(data, OrderNotFoundResult):
            result.limitations.append(
                "A requested business or order was not found; "
                "no delay cause can be established from that lookup."
            )
        elif isinstance(data, OrderFoundResult):
            result.limitations.append(
                "Order status and timestamps do not establish a delay's cause."
            )
        elif isinstance(data, BusinessesResult) and data.has_more:
            result.limitations.append(
                "The business list was truncated; it does not establish the full set of businesses."
            )
    if any(
        activity.error_code in {"round_limit", "tool_limit"} for activity in result.tool_activity
    ):
        result.status = "limit_exceeded"
    elif any(activity.status in {"failed", "rejected"} for activity in result.tool_activity):
        result.status = "partial"
    elif all(isinstance(evidence.result, OrderNotFoundResult) for evidence in result.evidence):
        result.status = "insufficient_evidence"
    result.limitations = list(dict.fromkeys(result.limitations))
    return result
