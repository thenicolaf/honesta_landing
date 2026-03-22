import { getAdminProducts, getProductFormOptions, getProductSalesMap } from "@/lib/productsDb";
import { ProductsPage } from "@/pages_flow/panel/products/ProductsPage";

export default async function AdminProductsPage() {
  const [products, { categories }, salesMap] = await Promise.all([
    getAdminProducts(),
    getProductFormOptions(),
    getProductSalesMap(),
  ]);

  return (
    <ProductsPage
      products={products}
      categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
      salesMap={salesMap}
    />
  );
}
