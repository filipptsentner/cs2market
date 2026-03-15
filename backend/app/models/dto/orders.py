from pydantic import BaseModel, Field


class SellOrderItemDto(BaseModel):
    catalog_item_id: str
    name: str
    slug: str
    image_url: str | None = None
    rarity: str | None = None
    weapon: str | None = None
    skin_name: str | None = None
    exterior: str | None = None


class SellOrderDto(BaseModel):
    sell_order_id: str
    seller_id: str
    inventory_item_id: str
    price_amount: int
    currency: str
    status: str
    created_at: str
    updated_at: str
    item: SellOrderItemDto


class SellOrderListResponseDto(BaseModel):
    items: list[SellOrderDto]
    total: int = Field(..., ge=0)
    limit: int = Field(..., ge=0)
    offset: int = Field(..., ge=0)