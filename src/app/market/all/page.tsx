"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemCard } from "@/components/market/item-card";
import { MarketTabs } from "@/components/market/market-tabs";
import { SidebarFilters } from "@/components/market/sidebar-filters";
import { SearchBar } from "@/components/market/search-bar";
import { items } from "@/data/items";
import { useMarketStore } from "@/store/market-store";

type SortMode = "price-desc" | "price-asc" | "user-orders-desc";

export default function MarketPage() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("price-desc");

  const orders = useMarketStore((state) => state.orders);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const marketItems = useMemo(() => {
    return items.map((item) => {
      const relatedOrders = orders.filter((order) => order.itemSlug === item.slug);
      const cheapestUserOrder =
        relatedOrders.length > 0
          ? [...relatedOrders].sort((a, b) => a.price - b.price)[0]
          : null;

      return {
        ...item,
        userOrdersCount: relatedOrders.length,
        cheapestUserOrderPrice: cheapestUserOrder?.price ?? null,
        canBuyViaMvp: relatedOrders.length > 0,
      };
    });
  }, [orders]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let result = marketItems.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch)
    );

    result = [...result].sort((a, b) => {
      if (sortMode === "price-asc") {
        return a.price - b.price;
      }

      if (sortMode === "price-desc") {
        return b.price - a.price;
      }

      if (b.userOrdersCount !== a.userOrdersCount) {
        return b.userOrdersCount - a.userOrdersCount;
      }

      const aPrice = a.cheapestUserOrderPrice ?? a.price;
      const bPrice = b.cheapestUserOrderPrice ?? b.price;

      return aPrice - bPrice;
    });

    return result;
  }, [marketItems, search, sortMode]);

  const itemsWithUserOrders = marketItems.filter((item) => item.userOrdersCount > 0).length;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <SidebarFilters />

        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <MarketTabs />

            <div className="flex gap-2">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none"
              >
                <option value="price-desc">Сначала дороже</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="user-orders-desc">Сначала с ордерами</option>
              </select>
            </div>
          </div>

          <SearchBar onSearch={setSearch} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Всего предметов</div>
              <div className="mt-2 text-2xl font-bold text-zinc-100">{marketItems.length}</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Найдено по поиску</div>
              <div className="mt-2 text-2xl font-bold text-zinc-100">
                {filteredItems.length}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Предметов с ордерами MVP</div>
              <div className="mt-2 text-2xl font-bold text-amber-300">
                {itemsWithUserOrders}
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">
              <div className="text-lg font-medium text-zinc-100">Ничего не найдено</div>
              <p className="mt-2 text-sm text-zinc-400">
                Попробуй изменить запрос или сбросить поиск.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userOrdersCount={item.userOrdersCount}
                  cheapestUserOrderPrice={item.cheapestUserOrderPrice}
                  canBuyViaMvp={item.canBuyViaMvp}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}