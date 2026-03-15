from fastapi import APIRouter
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.db import ping_db
from app.models.dto.health import HealthResponse


router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health_check() -> HealthResponse:
    database_status = "ok"

    try:
        ping_db()
    except SQLAlchemyError:
        database_status = "error"

    return HealthResponse(
        status="ok" if database_status == "ok" else "degraded",
        app=settings.app_name,
        env=settings.app_env,
        database=database_status,
    )
