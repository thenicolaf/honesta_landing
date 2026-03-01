import { Category } from "@/shared/types";
import { SLUG_TO_CATEGORY } from "@/sections/categories";

import type {
  DbProduct,
  DbProductGridProps,
  DbBenefit,
  LabelOption,
  Product,
  BadgeVariant,
} from "../types";

function resolveLabels(ids: number[] | null, options: LabelOption[]): string[] {
  if (!ids) return [];
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? "")
    .filter(Boolean);
}

export function mapDbProducts(
  raw: DbProduct[],
  refs: Omit<DbProductGridProps, "rawProducts">,
): Product[] {
  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline ?? "",
    badge: p.badge as BadgeVariant,
    price: Number(p.price),
    weight_g: p.weight_g ?? undefined,
    image_url: p.image_url ?? "",
    in_stock: p.in_stock ?? true,
    category:
      SLUG_TO_CATEGORY[p.categories?.slug ?? ""] ?? Category.DriedFruits,
    tags: resolveLabels(p.tag_ids, refs.tagOptions),
    freeFrom: resolveLabels(p.free_from_ids, refs.freeFromOptions),
    servingIdeas: resolveLabels(p.serving_idea_ids, refs.servingIdeaOptions),
    occasions: resolveLabels(p.occasion_ids, refs.occasionOptions),
    benefits: (p.benefit_ids ?? [])
      .map((id) => refs.benefits.find((b) => b.id === id))
      .filter((b): b is DbBenefit => b !== undefined),
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
