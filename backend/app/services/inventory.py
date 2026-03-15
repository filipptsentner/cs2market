from sqlalchemy.orm import Session

from app.models.dto.inventory import InventoryListResponseDto
from app.repositories.inventory import InventoryRepository


class InventoryService:
    def __init__(self, repository: InventoryRepository | None = None):
        self.repository = repository or InventoryRepository()

    def get_user_inventory(
        self,
        db: Session,
        *,
        user_id: str,
        status: str | None,
        limit: int,
        offset: int,
    ) -> InventoryListResponseDto:
        items, total = self.repository.list_user_inventory(
            db,
            user_id=user_id,
            status=status,
            limit=limit,
            offset=offset,
        )

        return InventoryListResponseDto(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
        )