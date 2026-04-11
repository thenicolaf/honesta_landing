import type { CartItem } from "@/sections/products/types/types";
import type { AppliedPromoCode } from "@/lib/promoCodeApply";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isItemEligible(item: CartItem, code: AppliedPromoCode): boolean {
  if (
    code.scope === "product" &&
    !code.eligibleProductIds.includes(item.productId)
  ) {
    return false;
  }
  if (!code.stackWithPromotions && item.originalPrice !== undefined) {
    return false;
  }
  return true;
}

/**
 * Returns a Map keyed by variantId with the promo code discount distributed
 * per single unit of each eligible item. Used to visualize the effective
 * per-unit price on cart cards (moss color, line-through original).
 *
 * Percentage codes distribute trivially (same rate for every eligible item).
 * Fixed codes distribute proportionally to each item's share of eligible
 * subtotal — mirrors how the server calculates the total discount.
 */
export function getPerItemPromoDiscounts(
  items: CartItem[],
  code: AppliedPromoCode | null,
): Map<string, number> {
  const map = new Map<string, number>();
  if (!code) return map;

  const eligibleSubtotal = items.reduce(
    (sum, i) => (isItemEligible(i, code) ? sum + i.price * i.quantity : sum),
    0,
  );
  if (eligibleSubtotal <= 0) return map;

  let rate: number;
  if (code.discountType === "percentage") {
    rate = code.discountValue / 100;
  } else {
    const effectiveFixed = Math.min(code.discountValue, eligibleSubtotal);
    rate = effectiveFixed / eligibleSubtotal;
  }

  for (const item of items) {
    if (!isItemEligible(item, code)) continue;
    map.set(item.variantId, round2(item.price * rate));
  }
  return map;
}

/**
 * Isomorphic recalculation of a promo code discount against the current cart.
 * Mirrors the server logic in `src/lib/promoCodeApply.ts` — used on the
 * client to update the discount instantly when items/quantities change,
 * before the server re-validation roundtrip completes.
 *
 * Returns 0 if no items are eligible — UI should treat that as "nothing
 * to discount right now", but the code itself stays applied and will be
 * re-validated on the server when items change again or at checkout.
 */
export function recalculatePromoDiscount(
  items: CartItem[],
  code: AppliedPromoCode,
): number {
  const targetIds = new Set(code.eligibleProductIds);

  const eligibleSubtotal = items.reduce((sum, item) => {
    if (code.scope === "product" && !targetIds.has(item.productId)) {
      return sum;
    }
    if (!code.stackWithPromotions && item.originalPrice !== undefined) {
      return sum;
    }
    return sum + item.price * item.quantity;
  }, 0);

  if (eligibleSubtotal <= 0) return 0;

  if (code.discountType === "percentage") {
    return round2((eligibleSubtotal * code.discountValue) / 100);
  }
  return round2(Math.min(code.discountValue, eligibleSubtotal));
}
