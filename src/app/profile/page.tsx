"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMarketStore } from "@/store/market-store";
import { toast } from "sonner";

export default function ProfilePage() {
  const balance = useMarketStore((state) => state.balance);
  const orders = useMarketStore((state) => state.orders);
  const inventory = useMarketStore((state) => state.inventory);
  const salesHistory = useMarketStore((state) => state.salesHistory);
  const cancelOrder = useMarketStore((state) => state.cancelOrder);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100">Профиль</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Баланс, активные ордера и история продаж
          </p>
        </div>

        <Link
          href="/market/all"
          className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
        >
          Перейти на рынок
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm text-zinc-400">Баланс</div>
          <div className="mt-3 text-3xl font-bold text-amber-300">
            ${balance.toFixed(2)}
          </div>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm text-zinc-400">Активные ордера</div>
          <div className="mt-3 text-3xl font-bold text-zinc-100">{orders.length}</div>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm text-zinc-400">Предметов в инвентаре</div>
          <div className="mt-3 text-3xl font-bold text-zinc-100">{inventory.length}</div>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm text-zinc-400">Продаж в истории</div>
          <div className="mt-3 text-3xl font-bold text-zinc-100">
            {salesHistory.length}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-100">Активные ордера</h2>
            <Link
              href="/orders"
              className="text-sm text-amber-300 transition hover:text-amber-200"
            >
              Открыть страницу ордеров
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded border border-dashed border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
              У вас пока нет активных ордеров.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        ACTIVE
                      </span>
                      <span className="text-sm text-green-400">{order.condition}</span>
                    </div>

                    <Link
                      href={`/item/${order.itemSlug}`}
                      className="block truncate text-base font-medium text-zinc-100 transition hover:text-amber-300"
                    >
                      {order.itemName}
                    </Link>

                    <div className="mt-1 text-sm text-zinc-400">
                      Создан: {order.createdAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Цена</div>
                      <div className="text-lg font-semibold text-amber-300">
                        ${order.price.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        cancelOrder(order.id);
                        toast.success("Ордер отменен, предмет возвращен в инвентарь.");
                      }}
                      className="rounded border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-100">История продаж</h2>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              {salesHistory.length} записей
            </span>
          </div>

          {salesHistory.length === 0 ? (
            <div className="rounded border border-dashed border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
              История продаж пока пуста.
            </div>
          ) : (
            <div className="space-y-3">
              {salesHistory.map((sale, index) => (
                <Link
                  key={`${sale.itemSlug}-${sale.date}-${index}`}
                  href={`/item/${sale.itemSlug}`}
                  className="block rounded border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-100">
                        {sale.itemName}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{sale.itemSlug}</div>
                      <div className="mt-2 text-xs text-zinc-400">{sale.date}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-zinc-400">Сумма покупки</div>
                      <div className="mt-1 text-base font-semibold text-amber-300">
                        ${sale.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 rounded border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="mb-4 text-xl font-semibold text-zinc-100">Быстрые переходы</h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/inventory"
            className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Инвентарь
          </Link>

          <Link
            href="/orders"
            className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Ордера
          </Link>

          <Link
            href="/market/all"
            className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Рынок
          </Link>
        </div>
      </div>
    </main>
  );
}