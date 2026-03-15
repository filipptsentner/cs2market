from sqlalchemy import text
from sqlalchemy.orm import Session


class InventoryRepository:
    def list_user_inventory(
        self,
        db: Session,
        *,
        user_id: str,
        status: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[dict], int]:
        where_clauses = ["ii.user_id = :user_id"]
        params: dict[str, object] = {
            "user_id": user_id,
            "limit": limit,
            "offset": offset,
        }

        if status:
            where_clauses.append("ii.status = :status")
            params["status"] = status

        where_sql = " and ".join(where_clauses)

        items_query = text(
            f"""
            select
                ii.id::text as inventory_item_id,
                ii.catalog_item_id::text as catalog_item_id,
                ii.asset_id,
                ii.class_id,
                ii.instance_id,
                ii.status,
                ii.price_snapshot,
                ii.created_at::text as created_at,
                ii.updated_at::text as updated_at,

                ci.id::text as catalog_id,
                ci.name as catalog_name,
                ci.slug as catalog_slug,
                ci.image_url as catalog_image_url,
                ci.rarity as catalog_rarity,
                ci.weapon as catalog_weapon,
                ci.skin_name as catalog_skin_name,
                ci.exterior as catalog_exterior
            from inventory_items ii
            join catalog_items ci on ci.id = ii.catalog_item_id
            where {where_sql}
            order by ii.created_at desc
            limit :limit
            offset :offset
            """
        )

        count_query = text(
            f"""
            select count(*) as total
            from inventory_items ii
            where {where_sql}
            """
        )

        items_result = db.execute(items_query, params)

        items: list[dict] = []
        for row in items_result.fetchall():
            item = dict(row._mapping)
            items.append(
                {
                    "inventory_item_id": item["inventory_item_id"],
                    "catalog_item_id": item["catalog_item_id"],
                    "asset_id": item["asset_id"],
                    "class_id": item["class_id"],
                    "instance_id": item["instance_id"],
                    "status": item["status"],
                    "price_snapshot": item["price_snapshot"],
                    "created_at": item["created_at"],
                    "updated_at": item["updated_at"],
                    "catalog": {
                        "id": item["catalog_id"],
                        "name": item["catalog_name"],
                        "slug": item["catalog_slug"],
                        "image_url": item["catalog_image_url"],
                        "rarity": item["catalog_rarity"],
                        "weapon": item["catalog_weapon"],
                        "skin_name": item["catalog_skin_name"],
                        "exterior": item["catalog_exterior"],
                    },
                }
            )

        total_result = db.execute(count_query, params)
        total = int(total_result.scalar_one())

        return items, total