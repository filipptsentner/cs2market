"use client";

import { create } from "zustand";
import { MarketItem, items as initialItems } from "@/data/items";

export type UserOrder = {
  id: string;
  itemId: string;
  itemName: string;
  itemSlug: string;
  itemImage: string;
  condition: string;
  price: number;
  createdAt: string;
  status: "active";
};

export type SaleRecord = {
  itemSlug: string;
  itemName: string;
  price: number;
  date: string;
};

type MarketState = {
  inventory: MarketItem[];
  orders: UserOrder[];
  salesHistory: SaleRecord[];
  balance: number;
  marketFeePercent: number;

  selectedInventoryItem: MarketItem | null;

  selectInventoryItem: (item: MarketItem | null) => void;
  createSellOrder: (item: MarketItem, price: number) => { ok: boolean; message: string };
  cancelOrder: (orderId: string) => void;
  buyCheapestOrder: (slug: string) => { ok: boolean; message: string };

  hydrateFromStorage: () => void;
};

const STORAGE_KEY = "skin-market-store";

export const useMarketStore = create<MarketState>((set, get) => ({
  inventory: initialItems,
  orders: [],
  salesHistory: [],
  balance: 500,
  marketFeePercent: 5,
  selectedInventoryItem: null,

  selectInventoryItem: (item) => set({ selectedInventoryItem: item }),

  createSellOrder: (item, price) => {
    if (!price || price <= 0) {
      return { ok: false, message: "Укажи корректную цену." };
    }

    set((state) => {
      const existsInInventory = state.inventory.some((entry) => entry.id === item.id);
      if (!existsInInventory) return state;

      const nextInventory = state.inventory.filter((entry) => entry.id !== item.id);

      const order: UserOrder = {
        id: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        itemSlug: item.slug,
        itemImage: item.image,
        condition: item.condition,
        price,
        createdAt: new Date().toLocaleString("ru-RU"),
        status: "active",
      };

      const nextOrders = [order, ...state.orders];

      persist(
        nextInventory,
        nextOrders,
        state.salesHistory,
        state.balance,
        state.marketFeePercent
      );

      return {
        inventory: nextInventory,
        orders: nextOrders,
        selectedInventoryItem: null,
      };
    });

    return { ok: true, message: "Ордер выставлен на продажу." };
  },

  cancelOrder: (orderId) => {
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const restoredItem: MarketItem = {
        id: order.itemId,
        slug: order.itemSlug,
        name: order.itemName,
        price: order.price,
        condition: order.condition as MarketItem["condition"],
        image: order.itemImage,
      };

      const nextOrders = state.orders.filter((o) => o.id !== orderId);
      const nextInventory = [restoredItem, ...state.inventory];

      persist(
        nextInventory,
        nextOrders,
        state.salesHistory,
        state.balance,
        state.marketFeePercent
      );

      return {
        inventory: nextInventory,
        orders: nextOrders,
      };
    });
  },

  buyCheapestOrder: (slug) => {
    const state = get();
    const relevantOrders = state.orders.filter((o) => o.itemSlug === slug);

    if (relevantOrders.length === 0) {
      return { ok: false, message: "Нет доступных пользовательских ордеров для покупки." };
    }

    const cheapest = [...relevantOrders].sort((a, b) => a.price - b.price)[0];

    if (state.balance < cheapest.price) {
      return { ok: false, message: "Недостаточно средств на балансе." };
    }

    set((current) => {
      const nextOrders = current.orders.filter((o) => o.id !== cheapest.id);

      const boughtItem: MarketItem = {
        id: crypto.randomUUID(),
        slug: cheapest.itemSlug,
        name: cheapest.itemName,
        price: cheapest.price,
        condition: cheapest.condition as MarketItem["condition"],
        image: cheapest.itemImage,
      };

      const nextInventory = [boughtItem, ...current.inventory];

      const saleRecord: SaleRecord = {
        itemSlug: cheapest.itemSlug,
        itemName: cheapest.itemName,
        price: cheapest.price,
        date: new Date().toLocaleString("ru-RU"),
      };

      const nextHistory = [saleRecord, ...current.salesHistory];
      const nextBalance = Number((current.balance - cheapest.price).toFixed(2));

      persist(
        nextInventory,
        nextOrders,
        nextHistory,
        nextBalance,
        current.marketFeePercent
      );

      return {
        inventory: nextInventory,
        orders: nextOrders,
        salesHistory: nextHistory,
        balance: nextBalance,
      };
    });

    return { ok: true, message: `Покупка выполнена за $${cheapest.price.toFixed(2)}.` };
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      const normalizedSalesHistory: SaleRecord[] = (parsed.salesHistory ?? []).map(
        (sale: Partial<SaleRecord>) => ({
          itemSlug: sale.itemSlug ?? "unknown-item",
          itemName: sale.itemName ?? sale.itemSlug ?? "Unknown item",
          price: sale.price ?? 0,
          date: sale.date ?? "",
        })
      );

      set({
        inventory: parsed.inventory ?? initialItems,
        orders: parsed.orders ?? [],
        salesHistory: normalizedSalesHistory,
        balance: parsed.balance ?? 500,
        marketFeePercent: parsed.marketFeePercent ?? 5,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));

function persist(
  inventory: MarketItem[],
  orders: UserOrder[],
  history: SaleRecord[],
  balance: number,
  marketFeePercent: number
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      inventory,
      orders,
      salesHistory: history,
      balance,
      marketFeePercent,
    })
  );
}