from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.core.db import get_db
from app.models.dto.inventory import InventoryListResponseDto
from app.services.inventory import InventoryService


router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=InventoryListResponseDto)
def get_inventory(
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> InventoryListResponseDto:
    service = InventoryService()
    return service.get_user_inventory(
        db,
        user_id=current_user_id,
        status=status,
        limit=limit,
        offset=offset,
    )
