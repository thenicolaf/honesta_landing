"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getCartFromDb } from "@/lib/cartDb";
import { getCart } from "@/lib/cart";
import { syncCartPrices } from "@/lib/syncCartPrices";
import type { CartItem } from "@/sections/products/types";
import { setStore, resetStore } from "./store";

export function useCartSync(userId: string | null | undefined) {
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

  return supabaseRef;
}
