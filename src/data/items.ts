export type MarketItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  condition: "FN" | "MW" | "FT" | "WW" | "BS";
  image: string;
};

export const items: MarketItem[] = [
  {
    id: "1",
    slug: "m4a4-neo-noir-mw",
    name: "M4A4 | Neo-Noir",
    price: 65,
    condition: "MW",
    image: "/items/m4a4-neo-noir.png",
  },
  {
    id: "2",
    slug: "usp-s-stainless-fn",
    name: "USP-S | Stainless",
    price: 109.92,
    condition: "FN",
    image: "/items/usp-s-stainless.png",
  },
  {
    id: "3",
    slug: "desert-eagle-printstream-mw",
    name: "Desert Eagle | Printstream",
    price: 49.02,
    condition: "MW",
    image: "/items/deagle-printstream.png",
  },
];