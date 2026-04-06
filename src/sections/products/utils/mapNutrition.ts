import type { AdminDbProduct } from "@/lib/productsDb";
import type { Benefit, NutritionInfo, Product } from "../types";
import { calculateDiscountedPrice, findActivePromotion } from "@/shared/utils/calculateDiscount";

export function mapNutrition(
  raw: AdminDbProduct["nutrition"],
): NutritionInfo | undefined {
  if (!raw || Object.keys(raw).length === 0) return undefined;
  return raw;
}

export interface MappedAdminProduct {
  badge?: string;
  category: string;
  tagline: string;
  tags: string[];
  freeFrom: string[];
  ingredients: string[];
  benefits: Benefit[];
  nutrition: NutritionInfo | undefined;
  servingIdeas: string[];
  occasions: string[];
  promotion: Product["promotion"];
}

export function mapAdminProduct(product: AdminDbProduct): MappedAdminProduct {
  const variants = (product.product_variants ?? [])
    .map((v) => Number(v.price))
    .sort((a, b) => a - b);
  const basePrice = variants[0] ?? 0;
  const activePromo = findActivePromotion(product.promotion_products);

  return {
    badge: product.badge ?? undefined,
    category: product.categories?.name ?? "—",
    tagline: product.tagline ?? "",
    tags: product.product_tags.map((pt) => pt.tag_options.label),
    freeFrom: product.product_free_froms.map(
      (pf) => pf.free_from_options.label,
    ),
    ingredients: (product.product_ingredients ?? []).map(
      (pi) => pi.ingredient_options.label,
    ),
    benefits: product.product_benefits.map((pb) => pb.benefits),
    nutrition: mapNutrition(product.nutrition),
    servingIdeas: product.product_serving_ideas.map(
      (ps) => ps.serving_idea_options.label,
    ),
    occasions: product.product_occasions.map(
      (po) => po.occasion_options.label,
    ),
    promotion: activePromo
      ? {
          name: activePromo.name,
          discountType: activePromo.discount_type as "percentage" | "fixed",
          discountValue: Number(activePromo.discount_value),
          discountedPrice: calculateDiscountedPrice(
            basePrice,
            activePromo.discount_type as "percentage" | "fixed",
            Number(activePromo.discount_value),
          ),
          endsAt: activePromo.ends_at,
        }
      : undefined,
  };
}
