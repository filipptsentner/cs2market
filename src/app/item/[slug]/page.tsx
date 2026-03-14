"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { items } from "@/data/items";
import { useMarketStore } from "@/store/market-store";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const mockSellOrders = [
  { price: 65.0, amount: 1, source: "market" as const },
  { price: 66.25, amount: 2, source: "market" as const },
  { price: 67.1, amount: 1, source: "market" as const },
  { price: 68.0, amount: 3, source: "market" as const },
];

const mockBuyOrders = [
  { price: 61.5, amount: 1 },
  { price: 60.8, amount: 2 },
  { price: 59.9, amount: 1 },
  { price: 58.75, amount: 4 },
];

const mockHistory = [
  { price: 64.2, date: "12.03.2026 17:40" },
  { price: 63.8, date: "12.03.2026 16:55" },
  { price: 65.1, date: "12.03.2026 15:20" },
  { price: 62.9, date: "12.03.2026 14:10" },
];

export default function ItemPage({ params }: Props) {
  const { slug } = use(params);

  const orders = useMarketStore((state) => state.orders);
  const balance = useMarketStore((state) => state.balance);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);
  const buyCheapestOrder = useMarketStore((state) => state.buyCheapestOrder);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const item = items.find((entry) => entry.slug === slug);

  const userSellOrders = useMemo(
    () =>
      orders
        .filter((order) => order.itemSlug === slug)
        .map((order) => ({
          price: order.price,
          amount: 1,
          source: "user" as const,
        })),
    [orders, slug]
  );

  const allSellOrders = useMemo(
    () => [...userSellOrders, ...mockSellOrders].sort((a, b) => a.price - b.price),
    [userSellOrders]
  );

  const cheapestUserOrder = useMemo(() => {
    if (userSellOrders.length === 0) return null;
    return [...userSellOrders].sort((a, b) => a.price - b.price)[0];
  }, [userSellOrders]);

  const bestAvailablePrice = allSellOrders[0]?.price ?? item?.price ?? 0;
  const canBuyUserOrder = userSellOrders.length > 0;

  if (!item) {
    return (
      <main className="mx-auto max-w-[1400px] p-6">
        <h1 className="text-2xl font-bold">Предмет не найден</h1>
        <Link href="/market/all" className="mt-4 inline-block text-amber-300 underline">
          Вернуться в маркет
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <Link href="/market/all" className="transition hover:text-amber-300">
          Рынок
        </Link>
        <span>/</span>
        <span className="text-zinc-200">{item.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="rounded border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-6 rounded bg-zinc-900 p-6">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-green-400">{item.condition}</div>
              <h1 className="text-3xl font-semibold text-zinc-100">{item.name}</h1>
              <p className="text-zinc-400">
                Карточка предмета MVP. Здесь видно лучшие цены, ваши ордера и историю.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Лучшая цена</div>
              <div className="mt-2 text-2xl font-bold text-amber-300">
                ${bestAvailablePrice.toFixed(2)}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Ваших ордеров</div>
              <div className="mt-2 text-2xl font-bold text-zinc-100">
                {userSellOrders.length}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Sell Orders</div>
              <div className="mt-2 text-2xl font-bold text-zinc-100">
                {allSellOrders.length}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Buy Orders</div>
              <div className="mt-2 text-2xl font-bold text-zinc-100">
                {mockBuyOrders.length}
              </div>
            </div>
          </div>

          {cheapestUserOrder ? (
            <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="mb-1 text-xs uppercase tracking-wide text-emerald-300">
                Ваш лучший ордер
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-zinc-200">
                  У вас есть активный ордер на этот предмет по цене{" "}
                  <span className="font-semibold text-emerald-300">
                    ${cheapestUserOrder.price.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/orders"
                  className="rounded border border-emerald-500/30 px-3 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/10"
                >
                  Открыть мои ордера
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
              У вас пока нет активных ордеров на этот предмет.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-4 text-xl font-semibold text-zinc-100">Sell Orders</h2>
              <div className="space-y-2">
                {allSellOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-zinc-300">Количество: {order.amount}</span>
                      {order.source === "user" && (
                        <span className="text-xs text-amber-300">Ваш ордер</span>
                      )}
                    </div>

                    <span
                      className={`text-lg font-semibold ${
                        order.source === "user" ? "text-amber-300" : "text-red-400"
                      }`}
                    >
                      ${order.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-4 text-xl font-semibold text-zinc-100">Buy Orders</h2>
              <div className="space-y-2">
                {mockBuyOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-4 py-3"
                  >
                    <span className="text-zinc-300">Количество: {order.amount}</span>
                    <span className="text-lg font-semibold text-green-400">
                      ${order.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">История продаж</h2>
            <div className="overflow-hidden rounded border border-zinc-800">
              <div className="grid grid-cols-2 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                <div>Дата</div>
                <div>Цена</div>
              </div>

              {mockHistory.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 border-t border-zinc-800 px-4 py-3 text-sm"
                >
                  <div className="text-zinc-300">{entry.date}</div>
                  <div className="font-medium text-zinc-100">${entry.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <div className="mb-2 text-sm text-zinc-400">Лучшая доступная цена</div>
            <div className="text-4xl font-bold text-zinc-100">
              ${bestAvailablePrice.toFixed(2)}
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Ваш баланс</div>
            <div className="mt-2 text-2xl font-semibold text-amber-300">
              ${balance.toFixed(2)}
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900 p-4 text-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Пользовательских ордеров</span>
              <span className="text-zinc-100">{userSellOrders.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-zinc-400">
              <span>Можно купить через MVP</span>
              <span className={canBuyUserOrder ? "text-emerald-300" : "text-red-400"}>
                {canBuyUserOrder ? "Да" : "Нет"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                const result = buyCheapestOrder(slug);

                if (result.ok) {
                  toast.success(result.message);
                  return;
                }

                toast.error(result.message);
              }}
              className="w-full rounded bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200"
            >
              Купить лучший пользовательский ордер
            </button>

            <Link
              href="/inventory"
              className="block w-full rounded border border-zinc-700 px-4 py-3 text-center font-semibold text-zinc-100 transition hover:bg-zinc-900"
            >
              Перейти в инвентарь
            </Link>

            <Link
              href="/orders"
              className="block w-full rounded border border-zinc-700 px-4 py-3 text-center font-semibold text-zinc-100 transition hover:bg-zinc-900"
            >
              Открыть мои ордера
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}