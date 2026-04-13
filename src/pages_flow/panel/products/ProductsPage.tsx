"use client";

import { EmptyState } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import { useFilteredAdminProducts } from "./useFilteredAdminProducts";
import { AdminProductToolbar } from "./AdminProductToolbar";
import { AdminProductCard } from "./AdminProductCard";

function AdminProductGrid({ products }: { products: AdminDbProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
