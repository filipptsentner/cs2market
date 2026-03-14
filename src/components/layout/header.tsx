"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMarketStore } from "@/store/market-store";

const navItems = [
  { href: "/market/all", label: "Рынок" },
  { href: "/inventory", label: "Инвентарь" },
  { href: "/orders", label: "Ордера" },
  { href: "/profile", label: "Профиль" },
];

export function Header() {
  const balance = useMarketStore((state) => state.balance);
  const hydrateFromStorage = useMarketStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-bold tracking-wide text-amber-200">
          MARKET
        </Link>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-100 transition hover:text-amber-200"
            >
              {item.label}
            </Link>
          ))}

          <div className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
            Баланс: <span className="font-semibold text-amber-300">${balance.toFixed(2)}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}