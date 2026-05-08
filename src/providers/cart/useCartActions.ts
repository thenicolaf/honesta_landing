"use client";

import { useCallback, type RefObject } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartStorage,
  findMatchingIndex,
} from "@/lib/cart";
import {
  upsertItemInDb,
  removeItemFromDb,
  updateQuantityInDb,
  clearCartInDb,
} from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
import { setStore, getItems, storePromo } from "./store";

export function useCartActions(
  userId: string | null | undefined,
  supabaseRef: RefObject<SupabaseClient | null>,
  onClearPromo: () => void,
) {
  function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    const qty = item.quantity ?? 1;
    if (userId && supabaseRef.current) {
      const items = getItems();
      const matchIdx = findMatchingIndex(items, item);
      const existing = matchIdx >= 0 ? items[matchIdx] : null;
      const newQty = existing ? existing.quantity + qty : qty;
      // Replace snapshot wholesale on re-add so the cart picks up any changes
      // (name, image, weight, price) and so a stale variantId from a previous
      // page render gets replaced by the fresh one — see findMatchingIndex.
      const newItems = existing
        ? items.map((i, idx) =>
            idx === matchIdx ? { ...item, quantity: newQty } : i,
          )
        : [...items, { ...item, quantity: qty }];
      setStore(newItems);
      // If we replaced a stale variantId, the old DB row was already
      // CASCADE-wiped by the variant deletion, but be defensive in case the
      // backend still has a row keyed on the old variantId.
      if (existing && existing.variantId !== item.variantId) {
        void removeItemFromDb(supabaseRef.current, userId, existing.variantId);
      }
      upsertItemInDb(supabaseRef.current, userId, {
        ...item,
        quantity: newQty,
      });
    } else {
      setStore(addItem(item));
    }
    trackAddToCart({ ...item, quantity: qty }, qty);
  }

  function removeFromCart(variantId: string) {
    const removed = getItems().find((i) => i.variantId === variantId);
    if (userId && supabaseRef.current) {
      setStore(getItems().filter((i) => i.variantId !== variantId));
      removeItemFromDb(supabaseRef.current, userId, variantId);
    } else {
      setStore(removeItem(variantId));
    }
    void cleanupOrphanedMixVariants([variantId]);
    if (removed) trackRemoveFromCart(removed, removed.quantity);
  }

  function updateItemQuantity(variantId: string, quantity: number) {
    const previous = getItems().find((i) => i.variantId === variantId);
    if (userId && supabaseRef.current) {
      if (quantity <= 0) {
        setStore(getItems().filter((i) => i.variantId !== variantId));
        removeItemFromDb(supabaseRef.current, userId, variantId);
        void cleanupOrphanedMixVariants([variantId]);
      } else {
        setStore(
          getItems().map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        );
        updateQuantityInDb(supabaseRef.current, userId, variantId, quantity);
      }
    } else {
      if (quantity <= 0) {
        setStore(updateQuantity(variantId, quantity));
        void cleanupOrphanedMixVariants([variantId]);
      } else {
        setStore(updateQuantity(variantId, quantity));
      }
    }
    if (previous) {
      if (quantity <= 0) {
        trackRemoveFromCart(previous, previous.quantity);
      } else if (quantity > previous.quantity) {
        trackAddToCart(
          { ...previous, quantity: quantity - previous.quantity },
          quantity - previous.quantity,
        );
      } else if (quantity < previous.quantity) {
        trackRemoveFromCart(previous, previous.quantity - quantity);
      }
    }
  }

  const clearCart = useCallback(() => {
    const variantIds = getItems().map((i) => i.variantId);
    if (userId && supabaseRef.current) {
      setStore([]);
      clearCartInDb(supabaseRef.current, userId);
    } else {
      clearCartStorage();
      setStore([]);
    }
    if (variantIds.length > 0) {
      void cleanupOrphanedMixVariants(variantIds);
    }
    storePromo(null);
    onClearPromo();
  }, [userId, supabaseRef, onClearPromo]);

  return { addToCart, removeFromCart, updateItemQuantity, clearCart };
}
