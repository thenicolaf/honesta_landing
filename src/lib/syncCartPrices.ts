import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";
import {
  calculateDiscountedPrice,
  findActivePromotion,
  type PromotionRow,
} from "@/shared/utils/calculateDiscount";

type ProductRow = {
  id: string;
  price: string;
  promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
};

/**
 * Syncs cart item prices with current product prices and active promotions.
 * Returns updated items and whether anything changed.
 */
export async function syncCartPrices(
  supabase: SupabaseClient,
  items: CartItem[],
): Promise<{ items: CartItem[]; changed: boolean }> {
  if (items.length === 0) return { items, changed: false };

  const { data } = await supabase
    .from("products")
    .select(
      "id, price, promotion_products(promotions(discount_type, discount_value, starts_at, ends_at, is_active))",
    )
    .in(
      "id",
      items.map((i) => i.id),
    );

  if (!data) return { items, changed: false };

  const productMap = new Map<string, ProductRow>();
  for (const p of data as ProductRow[]) {
    productMap.set(p.id, p);
  }

  let changed = false;

  const updated = items.map((item) => {
    const product = productMap.get(item.id);
    if (!product) return item;

    const originalPrice = Number(product.price);
    const activePromo = findActivePromotion(product.promotion_products);

    const correctPrice = activePromo
      ? calculateDiscountedPrice(
          originalPrice,
          activePromo.discount_type as "percentage" | "fixed",
          Number(activePromo.discount_value),
        )
      : originalPrice;

    if (item.price !== correctPrice || item.originalPrice !== originalPrice) {
      changed = true;
      return { ...item, price: correctPrice, originalPrice: originalPrice };
    }

    return item;
  });

  return { items: updated, changed };
}
