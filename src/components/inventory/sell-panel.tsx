"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { MarketItem } from "@/data/items";
import { useMarketStore } from "@/store/market-store";

type Props = {
  item: MarketItem | null;
  onSell: (price: number) => { ok: boolean; message: string };
};

export function SellPanel({ item, onSell }: Props) {
  const [price, setPrice] = useState("");
  const marketFeePercent = useMarketStore((state) => state.marketFeePercent);

  const numericPrice = Number(price || 0);

  const feeAmount = useMemo(() => {
    if (!numericPrice || numericPrice <= 0) return 0;
    return Number(((numericPrice * marketFeePercent) / 100).toFixed(2));
  }, [numericPrice, marketFeePercent]);

  const sellerReceives = useMemo(() => {
    if (!numericPrice || numericPrice <= 0) return 0;
    return Number((numericPrice - feeAmount).toFixed(2));
  }, [numericPrice, feeAmount]);

  if (!item) {
    return (
      <aside className="rounded border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="mb-2 text-xl font-semibold text-zinc-100">Выбранный предмет</h2>
        <p className="text-zinc-400">Выбери предмет из инвентаря слева.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="mb-4 text-xl font-semibold text-zinc-100">Продажа предмета</h2>

      <div className="mb-4 rounded bg-zinc-900 p-4">
        <div className="mb-3 aspect-square rounded bg-zinc-950 p-3">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={300}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm text-green-400">{item.condition}</div>
          <div className="text-base text-zinc-100">{item.name}</div>
        </div>
      </div>

      <label className="mb-2 block text-sm text-zinc-300">Цена продажи</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Например, 72.50"
        className="mb-4 w-full rounded border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none"
      />

      <div className="mb-4 space-y-2 rounded border border-zinc-800 bg-zinc-900 p-4 text-sm">
        <div className="flex items-center justify-between text-zinc-300">
          <span>Комиссия маркета ({marketFeePercent}%)</span>
          <span>${feeAmount.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-zinc-100">
          <span>Вы получите</span>
          <span className="font-semibold text-amber-300">${sellerReceives.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => {
          const result = onSell(numericPrice);

          if (result.ok) {
            toast.success(result.message);
            setPrice("");
            return;
          }

          toast.error(result.message);
        }}
        className="w-full rounded bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200"
      >
        Выставить на продажу
      </button>
    </aside>
  );
}