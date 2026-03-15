from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("")
def get_inventory() -> dict:
    return {"items": [], "total": 0, "limit": 20, "offset": 0}