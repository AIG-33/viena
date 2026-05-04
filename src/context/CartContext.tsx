"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SelectedOptions = Record<string, string>;

export interface CartItem {
  lineId: string;
  productId: string;
  slug: string;
  categoryId: string;
  name: string;
  catalogNumber?: string;
  image?: string;
  selectedOptions?: SelectedOptions;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "lineId">, qty?: number) => void;
  updateQuantity: (lineId: string, qty: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  hasItem: (productId: string, options?: SelectedOptions) => boolean;
  findLine: (productId: string, options?: SelectedOptions) => CartItem | undefined;
}

const STORAGE_KEY = "viena.cart.v2";

const CartContext = createContext<CartContextValue | null>(null);

function optionsKey(opts?: SelectedOptions): string {
  if (!opts) return "";
  const keys = Object.keys(opts).sort();
  if (!keys.length) return "";
  return keys.map((k) => `${k}=${opts[k]}`).join("|");
}

function makeLineId(productId: string, opts?: SelectedOptions): string {
  const k = optionsKey(opts);
  return k ? `${productId}::${k}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota or disabled storage — ignore
    }
  }, [items, isHydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, qty = 1) => {
    const lineId = makeLineId(item.productId, item.selectedOptions);
    setItems((prev) => {
      const existing = prev.find((p) => p.lineId === lineId);
      if (existing) {
        return prev.map((p) =>
          p.lineId === lineId ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [...prev, { ...item, lineId, quantity: qty }];
    });
  }, []);

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>((lineId, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((p) => p.lineId !== lineId);
      return prev.map((p) => (p.lineId === lineId ? { ...p, quantity: qty } : p));
    });
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>((lineId) => {
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      hasItem: (id, opts) => {
        const lineId = makeLineId(id, opts);
        return items.some((i) => (opts === undefined ? i.productId === id : i.lineId === lineId));
      },
      findLine: (id, opts) => {
        const lineId = makeLineId(id, opts);
        return items.find((i) => i.lineId === lineId);
      },
    }),
    [items, isHydrated, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
