import { cookies } from "next/headers";
import { ProductGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { getPublishedProducts, getProductSalesMap } from "@/lib/productsDb";
import { PRODUCTS_SHUFFLE_SEED_COOKIE } from "@/shared/consts";

export async function ProductsSection({
  fixedCategory,
  hideHeader,
}: {
  /** Lock the grid to one category slug (category page). */
  fixedCategory?: string;
  /** Suppress the built-in ProductHeader (the page renders its own <h1>). */
  hideHeader?: boolean;
} = {}) {
  const [rawProducts, categories, salesMap, cookieStore] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    getProductSalesMap(),
    cookies(),
  ]);

  const shuffleSeed =
    cookieStore.get(PRODUCTS_SHUFFLE_SEED_COOKIE)?.value ?? null;

  // Only offer categories that actually have published products — no empty
  // categories in the filter dropdown (TZ §12). Derived from the already
  // fetched published products, so no extra query.
  const presentSlugs = new Set(
    rawProducts.map((p) => p.categories?.slug).filter(Boolean),
  );
  const categoryOptions = categories
    .filter((c) => presentSlugs.has(c.slug))
    .map((c) => ({ value: c.slug, label: c.name }));

  return (
    <ProductGrid
      rawProducts={rawProducts}
      categories={categoryOptions}
      salesMap={salesMap}
      shuffleSeed={shuffleSeed}
      fixedCategory={fixedCategory}
      hideHeader={hideHeader}
    />
  );
}
