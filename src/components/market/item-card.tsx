import Link from "next/link";
import { MarketItem } from "@/data/items";

type Props = {
  item: MarketItem;
  userOrdersCount: number;
  cheapestUserOrderPrice: number | null;
  canBuyViaMvp: boolean;
};

export function ItemCard({
  item,
  userOrdersCount,
  cheapestUserOrderPrice,
  canBuyViaMvp,
}: Props) {
  return (
    <Link
      href={`/item/${item.slug}`}
      className={`block rounded border p-4 transition ${
        canBuyViaMvp
          ? "border-amber-500/30 bg-zinc-950 hover:border-amber-400/40 hover:bg-zinc-900"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-sm text-green-400">{item.condition}</div>

        {canBuyViaMvp ? (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
            Есть ордера
          </span>
        ) : (
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
            Только витрина
          </span>
        )}
      </div>

      <img
        src={item.image}
        alt={item.name}
        className="mb-4 aspect-square rounded bg-zinc-900 object-contain"
      />

      <div className="space-y-3">
        <div className="line-clamp-2 min-h-12 text-base text-zinc-100">
          {item.name}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-xs text-zinc-400">Базовая цена</div>
            <div className="mt-1 text-lg font-semibold text-zinc-100">
              ${item.price.toFixed(2)}
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-xs text-zinc-400">Ордеров MVP</div>
            <div className="mt-1 text-lg font-semibold text-zinc-100">
              {userOrdersCount}
            </div>
          </div>
        </div>

        {cheapestUserOrderPrice !== null ? (
          <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="text-xs text-emerald-300">Лучшая цена пользовательского ордера</div>
            <div className="mt-1 text-lg font-semibold text-emerald-200">
              ${cheapestUserOrderPrice.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="rounded border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-xs text-zinc-500">Пользовательские ордера отсутствуют</div>
            <div className="mt-1 text-sm text-zinc-400">
              Сейчас предмет доступен только как витрина каталога
            </div>
          </div>
        )}

        <div className="pt-1 text-sm font-medium text-amber-300">Открыть предмет →</div>
      </div>
    </Link>
  );
}