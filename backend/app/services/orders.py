from sqlalchemy.orm import Session

from app.models.dto.orders import SellOrderListResponseDto
from app.repositories.orders import OrderRepository


class OrderService:
    def __init__(self, repository: OrderRepository | None = None):
        self.repository = repository or OrderRepository()

    def list_sell_orders(
        self,
        db: Session,
        *,
        status: str | None,
        catalog_item_id: str | None,
        seller_id: str | None,
        sort: str | None,
        limit: int,
        offset: int,
    ) -> SellOrderListResponseDto:
        items, total = self.repository.list_sell_orders(
            db,
            status=status,
            catalog_item_id=catalog_item_id,
            seller_id=seller_id,
            sort=sort,
            limit=limit,
            offset=offset,
        )

        return SellOrderListResponseDto(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
        )