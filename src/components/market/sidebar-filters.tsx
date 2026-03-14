import {
  advancedFilters,
  itemConditions,
  itemQualities,
  primaryFilters,
} from "@/data/filters";

export function SidebarFilters() {
  return (
    <aside className="w-full rounded border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-100">Основные фильтры</h2>
      </div>

      <div className="px-3 py-2">
        {primaryFilters.map((filter) => (
          <button
            key={filter}
            className="flex w-full items-center justify-between rounded px-3 py-3 text-left text-zinc-200 transition hover:bg-zinc-900"
          >
            <span>{filter}</span>
            <span className="text-zinc-500">{">"}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-zinc-800 px-5 py-4">
        <h3 className="mb-3 text-base font-semibold text-zinc-100">
          Расширенные фильтры
        </h3>

        <div className="space-y-1">
          {advancedFilters.map((filter) => (
            <button
              key={filter}
              className="flex w-full items-center justify-between rounded px-3 py-3 text-left text-zinc-200 transition hover:bg-zinc-900"
            >
              <span>{filter}</span>
              <span className="text-zinc-500">{">"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 px-5 py-4">
        <h3 className="mb-4 text-base font-semibold text-zinc-100">Состояние</h3>

        <div className="space-y-3">
          {itemConditions.map((condition) => (
            <label
              key={condition.code}
              className="flex items-center justify-between gap-3"
            >
              <span className={condition.color}>{condition.label}</span>
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-700 bg-zinc-900" />
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 px-5 py-4">
        <h3 className="mb-4 text-base font-semibold text-zinc-100">Качество</h3>

        <div className="space-y-3">
          {itemQualities.map((quality) => (
            <label
              key={quality.code}
              className="flex items-center justify-between gap-3"
            >
              <span className={quality.color}>{quality.label}</span>
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-700 bg-zinc-900" />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}