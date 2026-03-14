import { marketTabs } from "@/data/filters";

export function MarketTabs() {
  return (
    <div className="overflow-x-auto rounded border border-zinc-800 bg-zinc-950">
      <div className="flex min-w-max items-center gap-8 px-5 py-4">
        {marketTabs.map((tab, index) => {
          const isActive = index === 0;

          return (
            <button
              key={tab}
              className={`relative whitespace-nowrap text-sm transition ${
                isActive
                  ? "font-semibold text-amber-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute -bottom-4 left-0 h-0.5 w-full bg-amber-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}