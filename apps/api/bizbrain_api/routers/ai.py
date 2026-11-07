from fastapi import APIRouter, Response

from bizbrain_api.ai.schemas import AskRequest, AskResponse
from bizbrain_api.ai.service import ask_question

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post(
    "/ask",
    response_model=AskResponse,
    responses={
        502: {"model": AskResponse},
        503: {"model": AskResponse},
        504: {"model": AskResponse},
    },
)
def ask(request: AskRequest, response: Response) -> AskResponse:
    # No request-wide database dependency: each approved tool owns its short session.
    result = ask_question(request.question)
    response.status_code = {"error": 502, "unavailable": 503, "timeout": 504}.get(
        result.status, 200
    )
    return result
