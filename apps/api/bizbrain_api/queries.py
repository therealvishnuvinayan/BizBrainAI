"""Small, read-only SQLAlchemy queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from bizbrain_api.models import Business, Order


def list_businesses(session: Session, limit: int) -> list[Business]:
    statement = select(Business).order_by(Business.created_at, Business.id).limit(limit)
    return list(session.scalars(statement))


def list_orders(session: Session, limit: int) -> list[Order]:
    statement = select(Order).order_by(Order.created_at.desc(), Order.id).limit(limit)
    return list(session.scalars(statement))


def get_order(session: Session, order_id: UUID) -> Order | None:
    statement = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    return session.scalar(statement)
