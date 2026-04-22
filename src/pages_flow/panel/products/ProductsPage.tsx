"use client";

import { EmptyState } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import { ADMIN_PRODUCT_GRID_CLASS } from "@/sections/products/ProductGridSkeleton";
import { useFilteredAdminProducts } from "./useFilteredAdminProducts";
import { AdminProductToolbar } from "./AdminProductToolbar";
import { AdminProductCard } from "./AdminProductCard";

function AdminProductGrid({ products }: { products: AdminDbProduct[] }) {
  return (
    <div className={ADMIN_PRODUCT_GRID_CLASS}>
      {products.map((product) => (
        <AdminProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

interface ProductsPageInnerProps {
  products: AdminDbProduct[];
  categoryItems: { value: string; label: string }[];
}

export function ProductsPageInner({
  products,
  categoryItems,
}: ProductsPageInnerProps) {
  const filters = useFilteredAdminProducts(products);

  return (
    <>
      <AdminProductToolbar categoryItems={categoryItems} filters={filters} />
      {filters.products.length === 0 ? (
        <EmptyState
          label="No products found"
          description="Try changing the filters or create a new product."
          action={{
            label: "New Product",
            href: "/panel/products/create",
            variant: "primary",
          }}
        />
      ) : (
        <AdminProductGrid products={filters.products} />
      )}
    </>
  );
}
