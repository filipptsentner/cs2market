from fastapi import APIRouter

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("")
def get_wallet() -> dict:
    return {
        "wallet_id": None,
        "user_id": None,
        "currency": "RUB",
        "balance": 0,
        "hold_balance": 0,
    }


@router.get("/transactions")
def get_wallet_transactions() -> dict:
    return {"items": [], "total": 0, "limit": 20, "offset": 0}
