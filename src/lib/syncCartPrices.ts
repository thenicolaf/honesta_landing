import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";
import {
  calculateDiscountedPrice,
  findActivePromotion,
  type PromotionRow,
} from "@/shared/utils/calculateDiscount";

type VariantRow = { id: string; weight_g: number; price: string };

type ProductRow = {
  id: string;
  product_variants: VariantRow[];
  promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
};

/**
 * Syncs cart item prices with current variant prices and active promotions.
 * Returns updated items and whether anything changed.
 */
export async function syncCartPrices(
  supabase: SupabaseClient,
  items: CartItem[],
): Promise<{ items: CartItem[]; changed: boolean }> {
  if (items.length === 0) return { items, changed: false };

  const productIds = [...new Set(items.map((i) => i.productId))];

  const { data } = await supabase
    .from("products")
    .select(
      "id, product_variants(id, weight_g, price), promotion_products(promotions(discount_type, discount_value, starts_at, ends_at, is_active))",
    )
    .in("id", productIds);

  if (!data) return { items, changed: false };

  const productMap = new Map<string, ProductRow>();
  for (const p of data as ProductRow[]) {
    productMap.set(p.id, p);
  }

  let changed = false;

  const updated = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) return item;

    // Find variant by variantId
    const variant = product.product_variants.find(
      (v) => v.id === item.variantId,
    );
    if (!variant) return item;

    const basePrice = Number(variant.price);
    const activePromo = findActivePromotion(product.promotion_products);

    const correctPrice = activePromo
      ? calculateDiscountedPrice(
          basePrice,
          activePromo.discount_type as "percentage" | "fixed",
          Number(activePromo.discount_value),
        )
      : basePrice;

    const correctOriginalPrice = activePromo ? basePrice : undefined;
    const correctEndsAt = activePromo?.ends_at ?? undefined;

    if (
      item.price !== correctPrice ||
      item.originalPrice !== correctOriginalPrice ||
      item.promotionEndsAt !== correctEndsAt ||
      item.weight_g !== variant.weight_g
    ) {
      changed = true;
      return {
        ...item,
        price: correctPrice,
        originalPrice: correctOriginalPrice,
        promotionEndsAt: correctEndsAt,
        weight_g: variant.weight_g,
      };
    }

    return item;
  });

  return { items: updated, changed };
}
