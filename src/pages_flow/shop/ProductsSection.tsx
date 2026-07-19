import { cookies } from "next/headers";
import { ProductGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { getPublishedProducts, getProductSalesMap } from "@/lib/productsDb";
import { PRODUCTS_SHUFFLE_SEED_COOKIE } from "@/shared/consts";

export async function ProductsSection() {
  const [rawProducts, categories, salesMap, cookieStore] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    getProductSalesMap(),
    cookies(),
  ]);

  const shuffleSeed =
    cookieStore.get(PRODUCTS_SHUFFLE_SEED_COOKIE)?.value ?? null;

  return (
    <ProductGrid
      rawProducts={rawProducts}
      categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
      salesMap={salesMap}
      shuffleSeed={shuffleSeed}
    />
  );
}
