from fastapi import FastAPI

from app.api.routers.catalog import router as catalog_router
from app.api.routers.health import router as health_router
from app.api.routers.inventory import router as inventory_router
from app.api.routers.orders import router as orders_router
from app.api.routers.trades import router as trades_router
from app.api.routers.wallets import router as wallets_router
from app.core.config import settings


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.app_debug,
        version="0.1.0",
    )

    api_prefix = "/api/v1"

    app.include_router(health_router, prefix=api_prefix)
    app.include_router(catalog_router, prefix=api_prefix)
    app.include_router(inventory_router, prefix=api_prefix)
    app.include_router(orders_router, prefix=api_prefix)
    app.include_router(wallets_router, prefix=api_prefix)
    app.include_router(trades_router, prefix=api_prefix)

    return app


app = create_application()
