from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.common.enums import SellOrderSort
from app.core.db import get_db
from app.models.dto.orders import SellOrderListResponseDto
from app.services.orders import OrderService


router = APIRouter(prefix="/sell-orders", tags=["orders"])


@router.get("", response_model=SellOrderListResponseDto)
def list_sell_orders(
    status: str | None = Query(default=None),
    catalog_item_id: UUID | None = Query(default=None),
    seller_id: UUID | None = Query(default=None),
    sort: SellOrderSort = Query(default=SellOrderSort.created_desc),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> SellOrderListResponseDto:
    service = OrderService()
    return service.list_sell_orders(
        db,
        status=status,
        catalog_item_id=str(catalog_item_id) if catalog_item_id else None,
        seller_id=str(seller_id) if seller_id else None,
        sort=sort.value,
        limit=limit,
        offset=offset,
    )
