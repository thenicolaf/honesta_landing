export interface PromotionRow {
  name: string;
  discount_type: string;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountType: "percentage" | "fixed",
  discountValue: number,
): number {
  if (discountType === "percentage") {
    return Math.max(0, originalPrice * (1 - discountValue / 100));
  }
  return Math.max(0, originalPrice - discountValue);
}

export function findActivePromotion(
  promotionProducts: { promotions: PromotionRow | PromotionRow[] }[],
): PromotionRow | null {
  const now = new Date();

  for (const pp of promotionProducts ?? []) {
    // Supabase may return promotions as object or array depending on join type
    const promos = Array.isArray(pp.promotions)
      ? pp.promotions
      : [pp.promotions];

    for (const promo of promos) {
      if (
        promo &&
        promo.is_active &&
        new Date(promo.starts_at) <= now &&
        new Date(promo.ends_at) > now
      ) {
        return promo;
      }
    }
  }
  return null;
}
