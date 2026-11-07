"""Opt-in, one-question live smoke check. Never imported or run by normal Pytest."""

import argparse

from bizbrain_api.ai.service import ask_question
from bizbrain_api.config import get_settings
from bizbrain_api.database import dispose_engine


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Allow one bounded, billable workflow")
    if not parser.parse_args().live:
        parser.error("Pass --live explicitly to allow a live OpenAI/Neon check.")
    settings = get_settings()
    if not settings.openai_api_key or not settings.openai_api_key.get_secret_value().strip():
        print("Live smoke blocked: configure OPENAI_API_KEY in the backend environment.")
        return 2
    try:
        settings.sqlalchemy_url()
    except ValueError:
        print("Live smoke blocked: configure the backend DATABASE_URL.")
        return 2
    try:
        result = ask_question("How many orders are in our database?")
        # This question returns only an aggregate; no credentials, question logs, or raw errors.
        print(result.model_dump_json(indent=2))
        counted = any(item.tool == "count_orders" for item in result.evidence)
        return 0 if result.status == "answered" and counted else 1
    finally:
        dispose_engine()


if __name__ == "__main__":
    raise SystemExit(main())
