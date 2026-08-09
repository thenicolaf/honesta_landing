/**
 * Fixed per-category SEO copy from the technical spec (TZ §9).
 *
 * The marketing title/description strings are canonical and must not be
 * derived from the DB — they are keyed by a stable concept id below and
 * resolved to a DB category via `SLUG_ALIASES` (real `categories.slug`
 * values → concept id). Any category slug not present in the alias map
 * falls back to the generic DB-derived metadata at the call site.
 */

export type CategorySeoKey =
  | "fruit-rolls"
  | "dried-fruits"
  | "jerky"
  | "dried-vegetables"
  | "ghee"
  | "mixes-gifts";

export interface CategorySeo {
  title: string;
  description: string;
}

export const CATEGORY_SEO: Record<CategorySeoKey, CategorySeo> = {
  "fruit-rolls": {
    title: "Natural Fruit Rolls Made in UAE | HONESTA",
    description:
      "Shop HONESTA fruit rolls made from real fruit purée and carefully dehydrated in the UAE for rich, naturally fruity taste.",
  },
  "dried-fruits": {
    title: "Premium Dried Fruits Made in UAE | HONESTA",
    description:
      "Explore HONESTA premium dried fruits, carefully prepared and dehydrated in the UAE for concentrated natural flavour.",
  },
  jerky: {
    title: "Premium Jerky Made in UAE | HONESTA",
    description:
      "Discover HONESTA jerky made in the UAE from carefully selected meat, balanced seasoning and controlled dehydration.",
  },
  "dried-vegetables": {
    title: "Premium Dried Vegetables Made in UAE | HONESTA",
    description:
      "Explore HONESTA dried vegetables made in the UAE for flavourful snacking, serving and creative culinary use.",
  },
  ghee: {
    title: "Premium Ghee Made in UAE | HONESTA",
    description:
      "Discover HONESTA premium ghee made in the UAE from quality butter for rich taste and versatile everyday use.",
  },
  "mixes-gifts": {
    title: "Natural Food Gift Boxes in UAE | HONESTA",
    description:
      "Explore HONESTA gift selections and personalised mixes featuring premium products made in the UAE.",
  },
};

/**
 * Real `categories.slug` values (from the DB) → concept id.
 * Categories without a TZ §9 entry (e.g. "healthy-snacks", "nuts") are
 * intentionally absent — they fall back to DB-derived metadata.
 */
export const SLUG_ALIASES: Record<string, CategorySeoKey> = {
  "fruit-roll": "fruit-rolls",
  "dried-fruits": "dried-fruits",
  jerky: "jerky",
  "dried-vegetables": "dried-vegetables",
  "ghee-essentials": "ghee",
  "mixes-gifts": "mixes-gifts",
};

/** Resolve fixed SEO copy for a category slug, or `null` if unmapped. */
export function getCategorySeo(slug: string): CategorySeo | null {
  const key = SLUG_ALIASES[slug];
  return key ? CATEGORY_SEO[key] : null;
}
