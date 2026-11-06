from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from bizbrain_api.database import get_session
from bizbrain_api.schemas import StatusRead

router = APIRouter(tags=["health"])


@router.get("/health", response_model=StatusRead)
def health() -> StatusRead:
    return StatusRead(status="ok")


@router.get("/ready", response_model=StatusRead)
def ready(session: Annotated[Session, Depends(get_session)]) -> StatusRead:
    session.execute(text("SELECT 1")).scalar_one()
    return StatusRead(status="ready")
