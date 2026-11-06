from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from bizbrain_api import queries
from bizbrain_api.database import get_session
from bizbrain_api.models import Order
from bizbrain_api.schemas import OrderDetailRead, OrderRead

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.get("", response_model=list[OrderRead])
def orders(
    session: Annotated[Session, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Order]:
    return queries.list_orders(session, limit)


@router.get("/{order_id}", response_model=OrderDetailRead)
def order(order_id: UUID, session: Annotated[Session, Depends(get_session)]) -> Order:
    result = queries.get_order(session, order_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return result
