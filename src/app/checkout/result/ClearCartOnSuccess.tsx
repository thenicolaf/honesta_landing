"use client";

import { useEffect } from "react";
import { useCart } from "@/providers";

/**
 * Flushes the in-memory cart store after a successful payment.
 *
 * The server has already wiped `cart_items` in the DB (and the inline
 * script in page.tsx cleared localStorage for guests), but the client
 * `CartProvider._items` persists across navigations until the next
 * mount — so without this component the cart UI stays populated until
 * a full page reload.
 *
 * `clearCart` is stable via useCallback in CartProvider, so this effect
 * runs exactly once per mount and doesn't need a ref guard.
 */
export function ClearCartOnSuccess({ success }: { success: boolean }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (success) clearCart();
  }, [success, clearCart]);

  return null;
}
