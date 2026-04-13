"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppliedPromoCode,
  PromoCodeApplyResult,
} from "@/lib/promoCodeApply";
import { applyPromoCodeAction } from "@/pages_flow/cart/actions";
import type { CartItem } from "@/sections/products/types";
import { loadStoredPromo, storePromo, getItems } from "./store";

export function useCartPromo(
  userId: string | null | undefined,
  items: CartItem[],
  isHydrated: boolean,
) {
  const [appliedPromoCode, setAppliedPromoCode] =
    useState<AppliedPromoCode | null>(null);

  // Load stored promo on mount; reset on user change
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (lastUserIdRef.current === undefined) {
      const stored = userId ? loadStoredPromo() : null;
      if (!userId) storePromo(null);
      setAppliedPromoCode(stored);
    } else if (lastUserIdRef.current !== userId) {
      storePromo(null);
      setAppliedPromoCode(null);
    }
    lastUserIdRef.current = userId;
  }, [userId]);

  // Re-validate applied promo on the server whenever items change
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
      setAppliedPromoCode(result.appliedCode);
      storePromo(result.appliedCode);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, isHydrated]);

  const applyPromoCode = useCallback(
    async (code: string): Promise<PromoCodeApplyResult> => {
      const result = await applyPromoCodeAction(code, getItems());
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

  return { appliedPromoCode, applyPromoCode, removePromoCode };
}
