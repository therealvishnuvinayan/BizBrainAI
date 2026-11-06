"""Pydantic v2 response contracts, separate from database persistence."""

from typing import Annotated
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

RequiredText = Annotated[str, Field(min_length=1, max_length=255)]


class StatusRead(BaseModel):
    status: str


class ORMRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BusinessRead(ORMRead):
    id: UUID
    name: RequiredText
    slug: RequiredText
    created_at: AwareDatetime


class OrderItemRead(ORMRead):
    id: UUID
    order_id: UUID
    sku: RequiredText
    quantity: Annotated[int, Field(gt=0, strict=True)]


class OrderRead(ORMRead):
    id: UUID
    business_id: UUID
    external_order_id: RequiredText
    status: Annotated[str, Field(min_length=1, max_length=100)]
    created_at: AwareDatetime
    promised_dispatch_at: AwareDatetime | None


class OrderDetailRead(OrderRead):
    items: list[OrderItemRead]
