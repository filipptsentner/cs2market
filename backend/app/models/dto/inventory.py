from pydantic import BaseModel, Field


class InventoryCatalogDto(BaseModel):
    id: str
    name: str
    slug: str
    image_url: str | None = None
    rarity: str | None = None
    weapon: str | None = None
    skin_name: str | None = None
    exterior: str | None = None


class InventoryItemDto(BaseModel):
    inventory_item_id: str
    catalog_item_id: str
    asset_id: str | None = None
    class_id: str | None = None
    instance_id: str | None = None
    status: str
    price_snapshot: int | None = None
    created_at: str
    updated_at: str
    catalog: InventoryCatalogDto


class InventoryListResponseDto(BaseModel):
    items: list[InventoryItemDto]
    total: int = Field(..., ge=0)
    limit: int = Field(..., ge=0)
    offset: int = Field(..., ge=0)