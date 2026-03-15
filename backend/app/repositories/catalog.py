from sqlalchemy import text
from sqlalchemy.orm import Session


class CatalogRepository:
    def list_items(
        self,
        db: Session,
        *,
        search: str | None,
        rarity: str | None,
        weapon: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[dict], int]:
        where_clauses = ["is_active = true"]
        params: dict[str, object] = {
            "limit": limit,
            "offset": offset,
        }

        if search:
            where_clauses.append(
                "(name ilike :search or market_hash_name ilike :search)"
            )
            params["search"] = f"%{search}%"

        if rarity:
            where_clauses.append("rarity = :rarity")
            params["rarity"] = rarity

        if weapon:
            where_clauses.append("weapon = :weapon")
            params["weapon"] = weapon

        where_sql = " and ".join(where_clauses)

        items_query = text(
            f"""
            select
                id::text as id,
                game,
                market_hash_name,
                name,
                slug,
                weapon,
                skin_name,
                exterior,
                rarity,
                image_url,
                is_active
            from catalog_items
            where {where_sql}
            order by name asc
            limit :limit
            offset :offset
            """
        )

        count_query = text(
            f"""
            select count(*) as total
            from catalog_items
            where {where_sql}
            """
        )

        items_result = db.execute(items_query, params)
        items = [dict(row._mapping) for row in items_result.fetchall()]

        total_result = db.execute(count_query, params)
        total = int(total_result.scalar_one())

        return items, total
