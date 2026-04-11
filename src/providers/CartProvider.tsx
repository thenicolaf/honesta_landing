"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
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
import { applyPromoCodeAction } from "@/pages_flow/cart/actions";
import type {
  AppliedPromoCode,
  PromoCodeApplyResult,
} from "@/lib/promoCodeApply";
import { recalculatePromoDiscount } from "@/shared/utils/recalculatePromoDiscount";

const PROMO_CODE_STORAGE_KEY = "honesta_promo_code";

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

// ─── Promo code persistence ───────────────────────────────────────────────────

function loadStoredPromo(): AppliedPromoCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROMO_CODE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppliedPromoCode;
    if (parsed && typeof parsed.id === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

function storePromo(promo: AppliedPromoCode | null) {
  if (typeof window === "undefined") return;
  if (promo) {
    window.localStorage.setItem(PROMO_CODE_STORAGE_KEY, JSON.stringify(promo));
  } else {
    window.localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  /** Subtotal (sum of price × quantity), without promo discount */
  subtotal: number;
  /** Subtotal minus applied promo discount */
  total: number;
  appliedPromoCode: AppliedPromoCode | null;
  promoDiscount: number;
  isHydrated: boolean;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (variantId: string) => void;
  updateItemQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<PromoCodeApplyResult>;
  removePromoCode: () => void;
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

  const [appliedPromoCode, setAppliedPromoCode] =
    useState<AppliedPromoCode | null>(null);

  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  // Load stored promo on mount; reset on user change
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (lastUserIdRef.current === undefined) {
      // initial mount — restore any saved promo (only meaningful if signed in)
      const stored = userId ? loadStoredPromo() : null;
      if (!userId) storePromo(null);
      setAppliedPromoCode(stored);
    } else if (lastUserIdRef.current !== userId) {
      // user changed (login/logout) — drop applied promo, since it's bound to a user
      storePromo(null);
      setAppliedPromoCode(null);
    }
    lastUserIdRef.current = userId;
  }, [userId]);

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

  // Re-validate applied promo on the server whenever items change. The
  // server returns the canonical promo definition (limits, eligibility,
  // stack_with_promotions, discountValue, endsAt) so we always replace
  // the cached client copy with the fresh server snapshot. Discount is
  // still recomputed synchronously below — the network call is just to
  // refresh metadata and detect invalidation.
  const itemsKey = items.map((i) => `${i.variantId}:${i.quantity}`).join("|");
  useEffect(() => {
    if (!appliedPromoCode || !isHydrated) return;
    let cancelled = false;
    (async () => {
      const result = await applyPromoCodeAction(appliedPromoCode.code, items);
      if (cancelled) return;
      if (!result.ok) {
        setAppliedPromoCode(null);
        storePromo(null);
        return;
      }
      // Refresh cached fields from the authoritative server response.
      // Without this, stale fields restored from localStorage (e.g. an
      // old `stackWithPromotions` flag) keep producing the wrong discount
      // until the user manually removes and re-applies the code.
      setAppliedPromoCode(result.appliedCode);
      storePromo(result.appliedCode);
    })();
    return () => {
      cancelled = true;
    };
    // re-run only when cart contents change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, isHydrated]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = getTotal(items);
  // Derive promo discount synchronously from the current cart snapshot so
  // it updates instantly on quantity changes. Server re-validation above
  // will drop the code entirely if it's no longer valid.
  const promoDiscount = appliedPromoCode
    ? recalculatePromoDiscount(items, appliedPromoCode)
    : 0;
  const total = Math.max(0, subtotal - promoDiscount);

  function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    if (userId && supabaseRef.current) {
      const qty = item.quantity ?? 1;
      const existing = _items.find((i) => i.variantId === item.variantId);
      const newQty = existing ? existing.quantity + qty : qty;
      const newItems = existing
        ? _items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: newQty } : i,
          )
        : [..._items, { ...item, quantity: qty }];
      setStore(newItems);
      upsertItemInDb(supabaseRef.current, userId, {
        ...item,
        quantity: newQty,
      });
    } else {
      setStore(addItem(item));
    }
  }

  function removeFromCart(variantId: string) {
    if (userId && supabaseRef.current) {
      setStore(_items.filter((i) => i.variantId !== variantId));
      removeItemFromDb(supabaseRef.current, userId, variantId);
    } else {
      setStore(removeItem(variantId));
    }
  }

  function updateItemQuantity(variantId: string, quantity: number) {
    if (userId && supabaseRef.current) {
      if (quantity <= 0) {
        setStore(_items.filter((i) => i.variantId !== variantId));
        removeItemFromDb(supabaseRef.current, userId, variantId);
      } else {
        setStore(
          _items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        );
        updateQuantityInDb(supabaseRef.current, userId, variantId, quantity);
      }
    } else {
      setStore(updateQuantity(variantId, quantity));
    }
  }

  const clearCart = useCallback(() => {
    if (userId && supabaseRef.current) {
      setStore([]);
      clearCartInDb(supabaseRef.current, userId);
    } else {
      clearCartStorage();
      setStore([]);
    }
    storePromo(null);
    setAppliedPromoCode(null);
  }, [userId]);

  const applyPromoCode = useCallback(
    async (code: string): Promise<PromoCodeApplyResult> => {
      const result = await applyPromoCodeAction(code, _items);
      if (result.ok) {
        setAppliedPromoCode(result.appliedCode);
        storePromo(result.appliedCode);
      }
      return result;
    },
    [],
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
    storePromo(null);
  }, []);

  return (
    <CartContext
      value={{
        items,
        itemCount,
        subtotal,
        total,
        appliedPromoCode,
        promoDiscount,
        isHydrated,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
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
