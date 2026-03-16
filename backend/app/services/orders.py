from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.common.errors import ConflictError, NotFoundError
from app.models.dto.orders import (
    CreateSellOrderResponseDto,
    SellOrderListResponseDto,
)
from app.repositories.inventory import InventoryRepository
from app.repositories.orders import OrderRepository


class OrderService:
    def __init__(
        self,
        order_repository: OrderRepository | None = None,
        inventory_repository: InventoryRepository | None = None,
    ):
        self.order_repository = order_repository or OrderRepository()
        self.inventory_repository = inventory_repository or InventoryRepository()

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
        items, total = self.order_repository.list_sell_orders(
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

    def create_sell_order(
        self,
        db: Session,
        *,
        user_id: str,
        inventory_item_id: str,
        price_amount: int,
        currency: str,
    ) -> CreateSellOrderResponseDto:
        try:
            inventory_item = self.inventory_repository.get_inventory_item_by_id(
                db,
                inventory_item_id=inventory_item_id,
            )

            if not inventory_item:
                raise NotFoundError(
                    code="INVENTORY_ITEM_NOT_FOUND",
                    message="Inventory item not found",
                )

            if inventory_item["user_id"] != user_id:
                raise ConflictError(
                    code="INVENTORY_ITEM_NOT_OWNED",
                    message="Inventory item does not belong to current user",
                )

            if inventory_item["status"] != "available":
                raise ConflictError(
                    code="INVENTORY_ITEM_NOT_AVAILABLE",
                    message="Inventory item is not available for listing",
                )

            has_active_order = self.order_repository.has_active_order_for_inventory_item(
                db,
                inventory_item_id=inventory_item_id,
            )

            if has_active_order:
                raise ConflictError(
                    code="ACTIVE_ORDER_ALREADY_EXISTS",
                    message="Active sell order already exists for this inventory item",
                )

            created_order = self.order_repository.create_sell_order(
                db,
                seller_id=user_id,
                inventory_item_id=inventory_item_id,
                price_amount=price_amount,
                currency=currency,
            )

            self.inventory_repository.update_inventory_item_status(
                db,
                inventory_item_id=inventory_item_id,
                status="listed",
            )

            db.commit()

            return CreateSellOrderResponseDto(**created_order)

        except IntegrityError:
            db.rollback()
            raise ConflictError(
                code="ACTIVE_ORDER_ALREADY_EXISTS",
                message="Active sell order already exists for this inventory item",
            )
        except Exception:
            db.rollback()
            raise
