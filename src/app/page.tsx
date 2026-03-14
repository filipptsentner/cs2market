import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Skin Market MVP</h1>
      <div className="flex flex-col gap-2">
        <Link href="/market/all" className="underline">Market</Link>
        <Link href="/inventory" className="underline">Inventory</Link>
        <Link href="/profile" className="underline">Profile</Link>
        <Link href="/orders" className="underline">Orders</Link>
      </div>
    </main>
  );
}