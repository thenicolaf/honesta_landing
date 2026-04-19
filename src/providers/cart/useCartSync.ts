"use client";

import { useCallback, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getCartFromDb } from "@/lib/cartDb";
import { getCart } from "@/lib/cart";
import { syncCartPrices } from "@/lib/syncCartPrices";
import type { ActivePromotionsMap } from "@/lib/promotionsDb";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import type { CartItem } from "@/sections/products/types";
import { setStore, resetStore, getItems } from "./store";

export function useCartSync(userId: string | null | undefined) {
  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  const userIdRef = useRef<string | null | undefined>(userId);

  useEffect(() => {
    userIdRef.current = userId;
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

  const refreshPrices = useCallback(async () => {
    const supabase = supabaseRef.current ?? createSupabaseBrowserClient();
    const currentUserId = userIdRef.current;
    const cartItems = currentUserId
      ? await getCartFromDb(supabase)
      : getItems();
    const { items: synced } = await syncCartPrices(supabase, cartItems);
    setStore(synced);
  }, []);

  const applyServerPromotions = useCallback(
    (promotions: ActivePromotionsMap) => {
      const current = getItems();
      if (current.length === 0) return;

      let changed = false;
      const updated = current.map((item) => {
        const promo = promotions[item.productId];
        const basePrice = item.originalPrice ?? item.price;
        const correctPrice = promo
          ? calculateDiscountedPrice(
              basePrice,
              promo.discount_type,
              promo.discount_value,
            )
          : basePrice;
        const correctOriginalPrice = promo ? basePrice : undefined;
        const correctEndsAt = promo?.ends_at ?? undefined;

        if (
          item.price !== correctPrice ||
          item.originalPrice !== correctOriginalPrice ||
          item.promotionEndsAt !== correctEndsAt
        ) {
          changed = true;
          return {
            ...item,
            price: correctPrice,
            originalPrice: correctOriginalPrice,
            promotionEndsAt: correctEndsAt,
          };
        }
        return item;
      });

      if (changed) setStore(updated);
    },
    [],
  );

  return { supabaseRef, refreshPrices, applyServerPromotions };
}
