from fastapi import APIRouter

router = APIRouter(prefix="/catalog-items", tags=["catalog"])


@router.get("")
def list_catalog_items() -> dict:
    return {"items": [], "total": 0, "limit": 20, "offset": 0}
