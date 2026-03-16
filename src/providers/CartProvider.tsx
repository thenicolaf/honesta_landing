"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getCartFromDb,
  upsertItemInDb,
  removeItemFromDb,
  updateQuantityInDb,
  clearCartInDb,
} from "@/lib/cartDb";
import { syncCartPrices } from "@/lib/syncCartPrices";

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

function resetStore() {
  _items = EMPTY;
  _isHydrated = false;
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

export function CartProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string | null;
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    resetStore();
    const supabase = createSupabaseBrowserClient();

    async function loadAndSync(cartItems: CartItem[]) {
      const { items: synced } = await syncCartPrices(supabase, cartItems);
      setStore(synced);
    }

    if (userId) {
      supabaseRef.current = supabase;
      getCartFromDb(supabase).then(loadAndSync);
    } else {
      supabaseRef.current = null;
      loadAndSync(getCart());
    }
  }, [userId]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = getTotal(items);

  function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    if (userId && supabaseRef.current) {
      const qty = item.quantity ?? 1;
      const existing = _items.find((i) => i.id === item.id);
      const newQty = existing ? existing.quantity + qty : qty;
      const newItems = existing
        ? _items.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
        : [..._items, { ...item, quantity: qty }];
      setStore(newItems);
      upsertItemInDb(supabaseRef.current, userId, {
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: newQty,
        image_url: item.image_url,
      });
    } else {
      setStore(addItem(item));
    }
  }

  function removeFromCart(id: string) {
    if (userId && supabaseRef.current) {
      setStore(_items.filter((i) => i.id !== id));
      removeItemFromDb(supabaseRef.current, userId, id);
    } else {
      setStore(removeItem(id));
    }
  }

  function updateItemQuantity(id: string, quantity: number) {
    if (userId && supabaseRef.current) {
      if (quantity <= 0) {
        setStore(_items.filter((i) => i.id !== id));
        removeItemFromDb(supabaseRef.current, userId, id);
      } else {
        setStore(_items.map((i) => (i.id === id ? { ...i, quantity } : i)));
        updateQuantityInDb(supabaseRef.current, userId, id, quantity);
      }
    } else {
      setStore(updateQuantity(id, quantity));
    }
  }

  function clearCart() {
    if (userId && supabaseRef.current) {
      setStore([]);
      clearCartInDb(supabaseRef.current, userId);
    } else {
      clearCartStorage();
      setStore([]);
    }
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
