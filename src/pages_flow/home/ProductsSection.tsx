import { ProductGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { getPublishedProducts, getProductSalesMap } from "@/lib/productsDb";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { readViewModeCookie } from "@/shared/utils/readViewModeCookie";
import { PRODUCTS_VIEW_COOKIE } from "@/shared/consts";

export async function ProductsSection() {
  const [rawProducts, categories, salesMap, initialMode] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    getProductSalesMap(),
    readViewModeCookie(PRODUCTS_VIEW_COOKIE),
  ]);

  return (
    <ViewModeProvider
      cookieKey={PRODUCTS_VIEW_COOKIE}
      initialMode={initialMode}
    >
      <ProductGrid
        rawProducts={rawProducts}
        categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
        salesMap={salesMap}
      />
    </ViewModeProvider>
  );
}
