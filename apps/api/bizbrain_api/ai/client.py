"""One synchronous SDK client per AI request, with explicit network limits."""

from openai import OpenAI

from bizbrain_api.config import get_settings

MODEL_TIMEOUT_SECONDS = 20.0


class ModelNotConfiguredError(RuntimeError):
    pass


def create_client() -> OpenAI:
    secret = get_settings().openai_api_key
    if secret is None or not secret.get_secret_value().strip():
        raise ModelNotConfiguredError("OpenAI is not configured.")
    return OpenAI(
        api_key=secret.get_secret_value(),
        base_url="https://api.openai.com/v1",
        timeout=MODEL_TIMEOUT_SECONDS,
        max_retries=0,
    )
