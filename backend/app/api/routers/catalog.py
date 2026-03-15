from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.dto.catalog import CatalogListResponseDto
from app.services.catalog import CatalogService


router = APIRouter(prefix="/catalog-items", tags=["catalog"])


@router.get("", response_model=CatalogListResponseDto)
def list_catalog_items(
    search: str | None = Query(default=None),
    rarity: str | None = Query(default=None),
    weapon: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> CatalogListResponseDto:
    service = CatalogService()
    return service.list_catalog_items(
        db,
        search=search,
        rarity=rarity,
        weapon=weapon,
        limit=limit,
        offset=offset,
    )
