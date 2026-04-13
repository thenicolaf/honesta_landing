"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { CartItem } from "@/sections/products/types";
import { getTotal } from "@/lib/cart";
import type { PromoCodeApplyResult, AppliedPromoCode } from "@/lib/promoCodeApply";
import { recalculatePromoDiscount } from "@/shared/utils/recalculatePromoDiscount";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getHydratedSnapshot,
  getHydratedServerSnapshot,
} from "./store";
import { useCartSync } from "./useCartSync";
import { useCartPromo } from "./useCartPromo";
import { useCartActions } from "./useCartActions";

// ─── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
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

// ─── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({
  children,
  userId,
  initialItemCount = 0,
}: {
  children: React.ReactNode;
  userId?: string | null;
  initialItemCount?: number;
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const supabaseRef = useCartSync(userId);
  const { appliedPromoCode, applyPromoCode, removePromoCode } =
    useCartPromo(userId, items, isHydrated);
  const { addToCart, removeFromCart, updateItemQuantity, clearCart } =
    useCartActions(userId, supabaseRef, removePromoCode);

  const itemCount = isHydrated
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : initialItemCount;
  const subtotal = getTotal(items);
  const promoDiscount = appliedPromoCode
    ? recalculatePromoDiscount(items, appliedPromoCode)
    : 0;
  const total = Math.max(0, subtotal - promoDiscount);

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

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
