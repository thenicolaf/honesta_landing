"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "@/sections/products/types";
import {
  getCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartStorage,
  getTotal,
} from "@/lib/cart";

// ─── External cart store ───────────────────────────────────────────────────────

const EMPTY: CartItem[] = [];
let _items: CartItem[] = EMPTY;
let _isHydrated = false;
const _listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

function getSnapshot() {
  return _items;
}
function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function getHydratedSnapshot() {
  return _isHydrated;
}
function getHydratedServerSnapshot() {
  return false;
}

function setStore(items: CartItem[]) {
  _items = items;
  _isHydrated = true;
  _listeners.forEach((l) => l());
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  isHydrated: boolean;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  // Hydrate from localStorage after mount (server always renders with empty cart)
  useEffect(() => {
    setStore(getCart());
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = getTotal(items);

  function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    setStore(addItem(item));
  }

  function removeFromCart(id: string) {
    setStore(removeItem(id));
  }

  function updateItemQuantity(id: string, quantity: number) {
    setStore(updateQuantity(id, quantity));
  }

  function clearCart() {
    clearCartStorage();
    setStore([]);
  }

  return (
    <CartContext
      value={{
        items,
        itemCount,
        total,
        isHydrated,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
