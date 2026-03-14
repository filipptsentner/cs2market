"use client";

import { useEffect } from "react";
import { InventoryCard } from "@/components/inventory/inventory-card";
import { SellPanel } from "@/components/inventory/sell-panel";
import { useMarketStore } from "@/store/market-store";

export default function InventoryPage() {
  const inventory = useMarketStore((state) => state.inventory);
  const selectedInventoryItem = useMarketStore(
    (state) => state.selectedInventoryItem
  );
  const selectInventoryItem = useMarketStore((state) => state.selectInventoryItem);
  const createSellOrder = useMarketStore((state) => state.createSellOrder);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6">
      <div className="mb-5">
        <h1 className="text-3xl font-semibold text-zinc-100">Инвентарь</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-4 text-sm text-zinc-400">
            Выбери предмет, который хочешь выставить на продажу
          </div>

          {inventory.length === 0 ? (
            <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
              Инвентарь пуст.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {inventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  selected={selectedInventoryItem?.id === item.id}
                  onClick={() => selectInventoryItem(item)}
                />
              ))}
            </div>
          )}
        </section>

        <SellPanel
          item={selectedInventoryItem}
          onSell={(price) => {
            if (!selectedInventoryItem) {
              return { ok: false, message: "Сначала выбери предмет." };
            }
            return createSellOrder(selectedInventoryItem, price);
          }}
        />
      </div>
    </main>
  );
}