from pydantic import BaseModel, Field


class CatalogItemDto(BaseModel):
    id: str
    game: str
    market_hash_name: str
    name: str
    slug: str
    weapon: str | None = None
    skin_name: str | None = None
    exterior: str | None = None
    rarity: str | None = None
    image_url: str | None = None
    is_active: bool


class CatalogListResponseDto(BaseModel):
    items: list[CatalogItemDto]
    total: int = Field(..., ge=0)
    limit: int = Field(..., ge=0)
    offset: int = Field(..., ge=0)
