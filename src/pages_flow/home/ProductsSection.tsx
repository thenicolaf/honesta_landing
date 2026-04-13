import { ProductGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { getPublishedProducts, getProductSalesMap } from "@/lib/productsDb";

export async function ProductsSection() {
  const [rawProducts, categories, salesMap] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
    getProductSalesMap(),
  ]);

  return (
    <ProductGrid
      rawProducts={rawProducts}
      categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
      salesMap={salesMap}
    />
  );
}
