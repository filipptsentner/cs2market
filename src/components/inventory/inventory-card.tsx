"use client";

import Image from "next/image";
import { MarketItem } from "@/data/items";

type Props = {
  item: MarketItem;
  selected?: boolean;
  onClick: () => void;
};

export function InventoryCard({ item, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`block rounded border p-3 text-left transition ${
        selected
          ? "border-amber-300 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      <div className="mb-3 aspect-square rounded bg-zinc-900 p-2">
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
        <div className="line-clamp-2 min-h-10 text-sm text-zinc-100">{item.name}</div>
      </div>
    </button>
  );
}