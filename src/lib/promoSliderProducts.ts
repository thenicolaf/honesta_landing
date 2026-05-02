import { getPublishedProducts, getProductSalesMap } from "./productsDb";
import { mapDbProducts } from "@/sections/products/utils/mapDbProducts";
import type { Product } from "@/sections/products/types";

interface PromoSliderOptions {
  /** Exclude a product (by id or slug) — used on product detail page so the current product doesn't appear in its own suggestions row. */
  excludeId?: string;
}

export async function getPromoSliderProducts(
  limit = 10,
  { excludeId }: PromoSliderOptions = {},
): Promise<Product[]> {
  const [raw, salesMap] = await Promise.all([
    getPublishedProducts(),
    getProductSalesMap(),
  ]);

  const mapped = mapDbProducts(raw, salesMap);

  const promo = mapped
    .filter((p) => p.promotion)
    .sort((a, b) => {
      const aEnds = a.promotion?.endsAt ?? "";
      const bEnds = b.promotion?.endsAt ?? "";
      return aEnds.localeCompare(bEnds);
    });

  const bestSellers = mapped
    .filter((p) => p.mark === "best_seller")
    .sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0));

  const seen = new Set<string>();
  if (excludeId) seen.add(excludeId);
  const out: Product[] = [];
  for (const product of [...promo, ...bestSellers]) {
    const key = product.id ?? product.slug;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(product);
    if (out.length >= limit) break;
  }

  return out;
}
