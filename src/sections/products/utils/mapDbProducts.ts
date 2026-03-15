import type { DbProduct, Product } from "../types";

export function mapDbProducts(raw: DbProduct[]): Product[] {
  return raw.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline ?? "",
    price: Number(p.price),
    weight_g: p.weight_g ?? undefined,
    image_url: p.image_url ?? "",
    in_stock: p.in_stock ?? true,
    category: p.categories?.name ?? "",
    tags: p.product_tags.map((pt) => pt.tag_options.label),
    freeFrom: p.product_free_froms.map((pf) => pf.free_from_options.label),
    servingIdeas: p.product_serving_ideas.map(
      (ps) => ps.serving_idea_options.label,
    ),
    occasions: p.product_occasions.map((po) => po.occasion_options.label),
    benefits: p.product_benefits.map((pb) => pb.benefits),
    nutrition: p.nutrition
      ? {
          calories: p.nutrition.calories,
          carbs: p.nutrition.carbs,
          naturalSugars: p.nutrition.natural_sugars,
          addedSugars: p.nutrition.added_sugars,
          fiber: p.nutrition.fiber,
          protein: p.nutrition.protein,
          fat: p.nutrition.fat,
          vitaminC: p.nutrition.vitamin_c,
        }
      : undefined,
  }));
}
