"use client";

import { useCallback, type RefObject } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartStorage,
} from "@/lib/cart";
import {
  upsertItemInDb,
  removeItemFromDb,
  updateQuantityInDb,
  clearCartInDb,
} from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import { setStore, getItems, storePromo } from "./store";

export function useCartActions(
  userId: string | null | undefined,
  supabaseRef: RefObject<SupabaseClient | null>,
  onClearPromo: () => void,
) {
  function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    if (userId && supabaseRef.current) {
      const items = getItems();
      const qty = item.quantity ?? 1;
      const existing = items.find((i) => i.variantId === item.variantId);
      const newQty = existing ? existing.quantity + qty : qty;
      const newItems = existing
        ? items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: newQty } : i,
          )
        : [...items, { ...item, quantity: qty }];
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
      setStore(getItems().filter((i) => i.variantId !== variantId));
      removeItemFromDb(supabaseRef.current, userId, variantId);
    } else {
      setStore(removeItem(variantId));
    }
    void cleanupOrphanedMixVariants([variantId]);
  }

  function updateItemQuantity(variantId: string, quantity: number) {
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
