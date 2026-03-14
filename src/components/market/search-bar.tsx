"use client";

import { useState } from "react";

type Props = {
  onSearch: (value: string) => void;
};

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        setValue(val);
        onSearch(val);
      }}
      placeholder="Поиск предметов..."
      className="w-full rounded border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none"
    />
  );
}