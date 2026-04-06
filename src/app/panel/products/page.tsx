import { getAdminProducts, getProductFormOptions } from "@/lib/productsDb";
import { ProductsPage } from "@/pages_flow/panel/products/ProductsPage";

export default async function AdminProductsPage() {
  const [products, { categories }] = await Promise.all([
    getAdminProducts(),
    getProductFormOptions(),
  ]);

  return (
    <ProductsPage
      products={products}
      categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
    />
  );
}
