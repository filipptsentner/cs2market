export function SortBar() {
  return (
    <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-5 py-4">
      <span className="text-sm font-semibold text-amber-300">По умолчанию</span>
      <button className="text-sm text-zinc-300 transition hover:text-zinc-100">
        Цена ↓
      </button>
    </div>
  );
}