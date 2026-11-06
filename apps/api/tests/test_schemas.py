from datetime import UTC, datetime
from uuid import UUID

import pytest
from pydantic import ValidationError

from bizbrain_api.schemas import BusinessRead, OrderItemRead, OrderRead


@pytest.mark.parametrize("quantity", [0, -1, 1.5, "2", True])
def test_item_quantity_requires_positive_integer(quantity: object) -> None:
    with pytest.raises(ValidationError):
        OrderItemRead(id=UUID(int=0), order_id=UUID(int=0), sku="x", quantity=quantity)


def test_business_requires_name() -> None:
    with pytest.raises(ValidationError):
        BusinessRead(id=UUID(int=0), slug="x", created_at=datetime.now(UTC))


def test_business_rejects_empty_name() -> None:
    with pytest.raises(ValidationError):
        BusinessRead(id=UUID(int=0), name="", slug="x", created_at=datetime.now(UTC))


@pytest.mark.parametrize("field", ["created_at", "promised_dispatch_at"])
def test_order_rejects_naive_timestamps(field: str) -> None:
    # Validation-only values are never passed to a database session.
    fields = {
        "id": UUID(int=0),
        "business_id": UUID(int=0),
        "external_order_id": "x",
        "status": "x",
        "created_at": datetime.now(UTC),
        "promised_dispatch_at": None,
    }
    fields[field] = datetime(2026, 1, 1)
    with pytest.raises(ValidationError):
        OrderRead.model_validate(fields)
