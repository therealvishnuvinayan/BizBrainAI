"""Thin HTTP service boundary; LangGraph owns all model/tool orchestration."""

from bizbrain_api.ai.client import ModelNotConfiguredError, create_client
from bizbrain_api.ai.graph import run_investigation
from bizbrain_api.ai.schemas import AskResponse
from bizbrain_api.ai.validation import stop
from bizbrain_api.config import get_settings


def ask_question(question: str) -> AskResponse:
    try:
        with create_client() as client:
            return run_investigation(question, client, get_settings().openai_model)
    except ModelNotConfiguredError:
        return stop(
            AskResponse(answer="", status="unavailable"),
            "unavailable",
            "The model service is not configured.",
        )
