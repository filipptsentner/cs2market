from sqlalchemy import text
from sqlalchemy.orm import Session


class OrderRepository:
    def list_sell_orders(
        self,
        db: Session,
        *,
        status: str | None,
        catalog_item_id: str | None,
        seller_id: str | None,
        sort: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[dict], int]:
        where_clauses = []
        params: dict[str, object] = {
            "limit": limit,
            "offset": offset,
        }

        if status:
            where_clauses.append("so.status = :status")
            params["status"] = status
        else:
            where_clauses.append("so.status = 'active'")

        if catalog_item_id:
            where_clauses.append("ii.catalog_item_id = :catalog_item_id")
            params["catalog_item_id"] = catalog_item_id

        if seller_id:
            where_clauses.append("so.seller_id = :seller_id")
            params["seller_id"] = seller_id

        where_sql = " and ".join(where_clauses) if where_clauses else "true"

        order_sql_map = {
            "price_asc": "so.price_amount asc, so.created_at desc",
            "price_desc": "so.price_amount desc, so.created_at desc",
            "created_asc": "so.created_at asc",
            "created_desc": "so.created_at desc",
        }
        order_sql = order_sql_map.get(sort or "created_desc", "so.created_at desc")

        items_query = text(
            f"""
            select
                so.id::text as sell_order_id,
                so.seller_id::text as seller_id,
                so.inventory_item_id::text as inventory_item_id,
                so.price_amount,
                so.currency,
                so.status,
                so.created_at::text as created_at,
                so.updated_at::text as updated_at,

                ci.id::text as catalog_item_id,
                ci.name as catalog_name,
                ci.slug as catalog_slug,
                ci.image_url as catalog_image_url,
                ci.rarity as catalog_rarity,
                ci.weapon as catalog_weapon,
                ci.skin_name as catalog_skin_name,
                ci.exterior as catalog_exterior
            from sell_orders so
            join inventory_items ii on ii.id = so.inventory_item_id
            join catalog_items ci on ci.id = ii.catalog_item_id
            where {where_sql}
            order by {order_sql}
            limit :limit
            offset :offset
            """
        )

        count_query = text(
            f"""
            select count(*) as total
            from sell_orders so
            join inventory_items ii on ii.id = so.inventory_item_id
            where {where_sql}
            """
        )

        items_result = db.execute(items_query, params)

        items: list[dict] = []
        for row in items_result.fetchall():
            item = dict(row._mapping)
            items.append(
                {
                    "sell_order_id": item["sell_order_id"],
                    "seller_id": item["seller_id"],
                    "inventory_item_id": item["inventory_item_id"],
                    "price_amount": item["price_amount"],
                    "currency": item["currency"],
                    "status": item["status"],
                    "created_at": item["created_at"],
                    "updated_at": item["updated_at"],
                    "item": {
                        "catalog_item_id": item["catalog_item_id"],
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

    def has_active_order_for_inventory_item(
        self,
        db: Session,
        *,
        inventory_item_id: str,
    ) -> bool:
        query = text(
            """
            select exists(
                select 1
                from sell_orders
                where inventory_item_id = :inventory_item_id
                  and status = 'active'
            )
            """
        )

        result = db.execute(
            query,
            {"inventory_item_id": inventory_item_id},
        ).scalar_one()

        return bool(result)

    def create_sell_order(
        self,
        db: Session,
        *,
        seller_id: str,
        inventory_item_id: str,
        price_amount: int,
        currency: str,
    ) -> dict:
        query = text(
            """
            insert into sell_orders (
                id,
                seller_id,
                inventory_item_id,
                price_amount,
                currency,
                status,
                created_at,
                updated_at
            )
            values (
                gen_random_uuid(),
                :seller_id,
                :inventory_item_id,
                :price_amount,
                :currency,
                'active',
                now(),
                now()
            )
            returning
                id::text as sell_order_id,
                seller_id::text as seller_id,
                inventory_item_id::text as inventory_item_id,
                price_amount,
                currency,
                status,
                created_at::text as created_at
            """
        )

        result = db.execute(
            query,
            {
                "seller_id": seller_id,
                "inventory_item_id": inventory_item_id,
                "price_amount": price_amount,
                "currency": currency,
            },
        ).fetchone()

        return dict(result._mapping)
