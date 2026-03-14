"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMarketStore } from "@/store/market-store";
import { toast } from "sonner";

export default function OrdersPage() {
  const orders = useMarketStore((state) => state.orders);
  const cancelOrder = useMarketStore((state) => state.cancelOrder);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100">Ордера</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Управление активными ордерами на продажу
          </p>
        </div>

        <Link
          href="/inventory"
          className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
        >
          Перейти в инвентарь
        </Link>
      </div>

      {orders.length === 0 ? (
        <section className="rounded border border-zinc-800 bg-zinc-950 p-8">
          <div className="rounded border border-dashed border-zinc-800 bg-zinc-900 p-8 text-center">
            <div className="text-lg font-medium text-zinc-100">Активных ордеров нет</div>
            <p className="mt-2 text-sm text-zinc-400">
              Выставь предмет из инвентаря, и он появится здесь.
            </p>

            <Link
              href="/inventory"
              className="mt-5 inline-flex rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
            >
              Открыть инвентарь
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-100">Активные ордера</h2>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              {orders.length} активн.
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded border border-zinc-800 bg-zinc-900 p-4 lg:flex-row lg:items-center lg:justify-between"
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
                    Slug: {order.itemSlug}
                  </div>

                  <div className="mt-1 text-sm text-zinc-400">
                    Создан: {order.createdAt}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-zinc-400">Цена продажи</div>
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
        </section>
      )}
    </main>
  );
}