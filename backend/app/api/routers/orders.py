from fastapi import APIRouter

router = APIRouter(prefix="/sell-orders", tags=["orders"])


@router.get("")
def list_sell_orders() -> dict:
    return {"items": [], "total": 0, "limit": 20, "offset": 0}