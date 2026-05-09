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
  title: string;
  slug: string;
  image_url: string | null;
  status: string;
  product_variants: VariantRow[];
  promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
};

/**
 * Syncs cart item prices, weights, and product metadata (name/slug/image)
 * with current DB state. Drops items whose product or variant no longer exists.
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
      "id, title, slug, image_url, status, product_variants(id, weight_g, price), promotion_products(promotions(discount_type, discount_value, starts_at, ends_at, is_active))",
    )
    .in("id", productIds);

  if (!data) return { items, changed: false };

  const productMap = new Map<string, ProductRow>();
  for (const p of data as ProductRow[]) {
    productMap.set(p.id, p);
  }

  let changed = false;

  const updated = items.flatMap((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      changed = true;
      return [];
    }

    const variant = product.product_variants.find(
      (v) => v.id === item.variantId,
    );
    if (!variant) {
      changed = true;
      return [];
    }

    const isMix = product.status === "system";
    const basePrice = Number(variant.price);
    // Mixes never carry promotions — composition prices are fixed at assembly.
    const activePromo = isMix
      ? null
      : findActivePromotion(product.promotion_products);

    const correctPrice = activePromo
      ? calculateDiscountedPrice(
          basePrice,
          activePromo.discount_type as "percentage" | "fixed",
          Number(activePromo.discount_value),
        )
      : basePrice;

    const correctOriginalPrice = activePromo ? basePrice : undefined;
    const correctEndsAt = activePromo?.ends_at ?? undefined;
    const correctImageUrl = product.image_url ?? undefined;

    if (
      item.price !== correctPrice ||
      item.originalPrice !== correctOriginalPrice ||
      item.promotionEndsAt !== correctEndsAt ||
      item.weight_g !== variant.weight_g ||
      item.name !== product.title ||
      item.slug !== product.slug ||
      item.image_url !== correctImageUrl
    ) {
      changed = true;
      return {
        ...item,
        name: product.title,
        slug: product.slug,
        image_url: correctImageUrl,
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
