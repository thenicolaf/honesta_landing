import type { CartItem } from "@/sections/products/types/types";
import {
  getPromoCodeByCode,
  getPromoCodeUsageCountTotal,
  getPromoCodeUsageCountByUser,
  type PromoCodeWithRelations,
} from "@/lib/promoCodesDb";

export interface AppliedPromoCode {
  id: string;
  code: string;
  scope: "cart" | "product";
  discountType: "percentage" | "fixed";
  discountValue: number;
  stackWithPromotions: boolean;
  /** Final discount amount in AED applied to the cart */
  discount: number;
  /** product IDs the code targets (empty for cart scope) */
  eligibleProductIds: string[];
  /** ISO date string — when the promo code expires */
  endsAt: string | null;
}

export type PromoCodeApplyResult =
  | { ok: true; appliedCode: AppliedPromoCode }
  | { ok: false; error: string };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getEligibleItems(
  items: CartItem[],
  promoCode: PromoCodeWithRelations,
): CartItem[] {
  const productIdSet = new Set(promoCode.product_ids);
  return items.filter((item) => {
    if (
      promoCode.scope === "product" &&
      !productIdSet.has(item.productId)
    ) {
      return false;
    }
    if (!promoCode.stack_with_promotions && item.originalPrice !== undefined) {
      // Item already has an active promotion → exclude
      return false;
    }
    return true;
  });
}

function calculateDiscount(
  eligibleItems: CartItem[],
  promoCode: PromoCodeWithRelations,
): number {
  const eligibleSubtotal = eligibleItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  if (eligibleSubtotal <= 0) return 0;

  if (promoCode.discount_type === "percentage") {
    return round2((eligibleSubtotal * promoCode.discount_value) / 100);
  }
  return round2(Math.min(promoCode.discount_value, eligibleSubtotal));
}

interface ValidateParams {
  code: string;
  items: CartItem[];
  userId: string | null | undefined;
}

/**
 * Server-side validation and discount calculation for a promo code.
 * Caller must run this from a server context. Always returns a result;
 * never throws on validation failures.
 *
 * Promo codes are restricted to authenticated users — guests get an error.
 */
export async function validatePromoCode({
  code,
  items,
  userId,
}: ValidateParams): Promise<PromoCodeApplyResult> {
  if (!userId) {
    return { ok: false, error: "Sign in to use a promo code" };
  }

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { ok: false, error: "Enter a promo code" };
  }

  const promoCode = await getPromoCodeByCode(trimmed);
  if (!promoCode) {
    return { ok: false, error: "Invalid promo code" };
  }

  // Status (active flag + date range)
  if (!promoCode.is_active) {
    return { ok: false, error: "Promo code is inactive" };
  }
  const now = new Date();
  if (new Date(promoCode.starts_at) > now) {
    return { ok: false, error: "Promo code is not active yet" };
  }
  if (promoCode.ends_at && new Date(promoCode.ends_at) <= now) {
    return { ok: false, error: "Promo code has expired" };
  }

  // User targeting
  if (promoCode.user_ids.length > 0 && !promoCode.user_ids.includes(userId)) {
    return { ok: false, error: "This code is not valid for your account" };
  }

  // Minimum order amount (calculated from full subtotal, not eligible)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (
    promoCode.min_order_amount != null &&
    subtotal < promoCode.min_order_amount
  ) {
    return {
      ok: false,
      error: `Minimum order of AED ${promoCode.min_order_amount} required`,
    };
  }

  // Usage limits
  if (promoCode.max_uses != null) {
    const total = await getPromoCodeUsageCountTotal(promoCode.id);
    if (total >= promoCode.max_uses) {
      return { ok: false, error: "Promo code limit reached" };
    }
  }
  if (promoCode.max_uses_per_user != null) {
    const used = await getPromoCodeUsageCountByUser(promoCode.id, userId);
    if (used >= promoCode.max_uses_per_user) {
      return { ok: false, error: "You have already used this code" };
    }
  }

  // Eligible items
  const eligible = getEligibleItems(items, promoCode);
  if (eligible.length === 0) {
    if (!promoCode.stack_with_promotions) {
      return {
        ok: false,
        error:
          "No eligible items in cart (items already on sale are excluded)",
      };
    }
    return { ok: false, error: "No eligible items in cart for this code" };
  }

  const discount = calculateDiscount(eligible, promoCode);
  if (discount <= 0) {
    return { ok: false, error: "No eligible items in cart for this code" };
  }

  return {
    ok: true,
    appliedCode: {
      id: promoCode.id,
      code: promoCode.code,
      scope: promoCode.scope,
      discountType: promoCode.discount_type,
      discountValue: promoCode.discount_value,
      stackWithPromotions: promoCode.stack_with_promotions,
      discount,
      eligibleProductIds: promoCode.product_ids,
      endsAt: promoCode.ends_at,
    },
  };
}
