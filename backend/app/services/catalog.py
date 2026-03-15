from sqlalchemy.orm import Session

from app.models.dto.catalog import CatalogListResponseDto
from app.repositories.catalog import CatalogRepository


class CatalogService:
    def __init__(self, repository: CatalogRepository | None = None):
        self.repository = repository or CatalogRepository()

    def list_catalog_items(
        self,
        db: Session,
        *,
        search: str | None,
        rarity: str | None,
        weapon: str | None,
        limit: int,
        offset: int,
    ) -> CatalogListResponseDto:
        items, total = self.repository.list_items(
            db,
            search=search,
            rarity=rarity,
            weapon=weapon,
            limit=limit,
            offset=offset,
        )

        return CatalogListResponseDto(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
        )
