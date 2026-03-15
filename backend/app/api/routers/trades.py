from fastapi import APIRouter

router = APIRouter(prefix="/trades", tags=["trades"])


@router.get("")
def get_trades() -> dict:
    return {"items": [], "total": 0, "limit": 20, "offset": 0}
