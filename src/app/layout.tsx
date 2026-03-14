import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Skin Market MVP",
  description: "Clickable marketplace skeleton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-zinc-950 text-zinc-100">
        <Header />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}