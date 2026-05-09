"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getCartFromDb } from "@/lib/cartDb";
import { getCart, saveCart } from "@/lib/cart";
import { syncCartPrices } from "@/lib/syncCartPrices";
import type { ActivePromotionsMap } from "@/lib/promotionsDb";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import { setStore, resetStore, getItems } from "./store";

export function useCartSync(userId: string | null | undefined) {
  const supabaseRef =
    useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  const userIdRef = useRef<string | null | undefined>(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Guests: hydrate from localStorage SYNCHRONOUSLY before paint so the navbar
  // counter shows the correct number on first frame (no SSR data available for
  // a localStorage-backed cart). Price/variant sync runs separately below.
  useLayoutEffect(() => {
    if (userId) return;
    setStore(getCart());
  }, [userId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (userId) {
      // Auth users: server already provided initialItemCount; wait for the
      // DB-backed cart to load before flipping isHydrated, so we don't briefly
      // render an empty cart on top of an existing badge.
      resetStore();
      supabaseRef.current = supabase;
      // getCartFromDb already JOINs products + variants + promotions, so its
      // output is fully fresh — no need to run syncCartPrices on top.
      getCartFromDb(supabase).then((cartItems) => {
        setStore(cartItems);
      });
    } else {
      supabaseRef.current = null;
      // localStorage already hydrated above; refresh prices in the background
      // and only re-set the store if anything actually changed.
      void (async () => {
        const { items: synced, changed } = await syncCartPrices(
          supabase,
          getItems(),
        );
        if (changed) {
          setStore(synced);
          // Persist to localStorage too — otherwise stale items keep
          // resurfacing from storage on every page reload.
          saveCart(synced);
        }
      })();
    }
  }, [userId]);

  const refreshPrices = useCallback(async () => {
    const supabase = supabaseRef.current ?? createSupabaseBrowserClient();
    const currentUserId = userIdRef.current;
    if (currentUserId) {
      const fresh = await getCartFromDb(supabase);
      setStore(fresh);
      return;
    }
    const { items: synced } = await syncCartPrices(supabase, getItems());
    setStore(synced);
    saveCart(synced);
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
