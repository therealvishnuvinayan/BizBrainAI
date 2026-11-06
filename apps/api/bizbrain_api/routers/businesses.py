from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from bizbrain_api import queries
from bizbrain_api.database import get_session
from bizbrain_api.models import Business
from bizbrain_api.schemas import BusinessRead

router = APIRouter(prefix="/api/v1/businesses", tags=["businesses"])


@router.get("", response_model=list[BusinessRead])
def businesses(
    session: Annotated[Session, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Business]:
    return queries.list_businesses(session, limit)
