import type { DbProduct, Product, ProductVariant } from "../types";
import { calculateDiscountedPrice, findActivePromotion } from "@/shared/utils/calculateDiscount";
import { mapNutrition } from "./mapNutrition";

export function mapDbProducts(
  raw: DbProduct[],
  salesMap?: Record<string, number>,
): Product[] {
  return raw.map((p) => {
    const variants: ProductVariant[] = (p.product_variants ?? [])
      .map((v) => ({ id: v.id, weight_g: v.weight_g, price: Number(v.price) }))
      .sort((a, b) => a.weight_g - b.weight_g);

    const defaultVariant = variants[0];
    const originalPrice = defaultVariant?.price ?? 0;

    const activePromo = findActivePromotion(p.promotion_products);

    const promotion = activePromo
      ? {
          name: activePromo.name,
          discountType: activePromo.discount_type as "percentage" | "fixed",
          discountValue: Number(activePromo.discount_value),
          discountedPrice: calculateDiscountedPrice(
            originalPrice,
            activePromo.discount_type as "percentage" | "fixed",
            Number(activePromo.discount_value),
          ),
          endsAt: activePromo.ends_at,
        }
      : undefined;

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagline: p.tagline ?? "",
      price: originalPrice,
      weight_g: defaultVariant?.weight_g,
      variants,
      image_url: p.image_url ?? "",
      images: (p.images as string[] | null) ?? [],
      video_url: p.video_url ?? null,
      in_stock: p.in_stock ?? true,
      badge: p.badge ?? undefined,
      note: p.note ?? undefined,
      category: p.categories?.name ?? "",
      tags: p.product_tags.map((pt) => pt.tag_options.label),
      freeFrom: p.product_free_froms.map((pf) => pf.free_from_options.label),
      ingredients: (p.product_ingredients ?? []).map((pi) => pi.ingredient_options.label),
      servingIdeas: p.product_serving_ideas.map(
        (ps) => ps.serving_idea_options.label,
      ),
      occasions: p.product_occasions.map((po) => po.occasion_options.label),
      benefits: p.product_benefits.map((pb) => pb.benefits),
      nutrition: mapNutrition(p.nutrition),
      mark: p.mark ?? "standard",
      promotion,
      totalSold: salesMap?.[p.id] ?? 0,
    };
  });
}
