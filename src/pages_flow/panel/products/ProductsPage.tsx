"use client";

import { Plus } from "lucide-react";
import { Button, FilterBar, EmptyState } from "@/shared/ui";
import { ProductStatus } from "@/shared/types";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { useFilterBar } from "@/providers/FilterProvider";
import type { AdminDbProduct } from "@/lib/productsDb";
import { ProductActionsProvider } from "./ProductActionsProvider";
import { AdminProductCard } from "./AdminProductCard";

// ─── Filter items ────────────────────────────────────────────────────────────

const STATUS_ITEMS = [
  { value: ProductStatus.DRAFT, label: "Draft" },
  { value: ProductStatus.PUBLISHED, label: "Published" },
  { value: ProductStatus.ARCHIVED, label: "Archived" },
];

// ─── ProductsPageInner ──────────────────────────────────────────────────────

interface ProductsPageInnerProps {
  products: AdminDbProduct[];
  categoryItems: { value: string; label: string }[];
}

function ProductsPageInner({
  products,
  categoryItems,
}: ProductsPageInnerProps) {
  const statusFilter = useFilterBar("status");
  const categoryFilter = useFilterBar("category");

  const filtered = products.filter((p) => {
    if (statusFilter.value && p.status !== statusFilter.value) return false;
    if (categoryFilter.value && p.categories?.slug !== categoryFilter.value)
      return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <FilterBar {...statusFilter} items={STATUS_ITEMS} label="Status" />
        {categoryItems.length > 1 && (
          <>
            <FilterBar
              {...categoryFilter}
              items={categoryItems}
              allLabel="All Categories"
              label="Category"
            />
          </>
        )}
      </div>

      {filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((product) => (
            <AdminProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

// ─── ProductsPage ────────────────────────────────────────────────────────────

interface ProductsPageProps {
  products: AdminDbProduct[];
  categories: { value: string; label: string }[];
}

export function ProductsPage({ products, categories }: ProductsPageProps) {
  return (
    <ProductActionsProvider>
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
          Admin Panel
        </p>
        <Button
          as="a"
          href="/panel/products/create"
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} aria-hidden="true" />}
        >
          New Product
        </Button>
      </div>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Products
      </h1>

      <SearchParamsFilterProvider keys={["status", "category"]}>
        <ProductsPageInner products={products} categoryItems={categories} />
      </SearchParamsFilterProvider>
    </ProductActionsProvider>
  );
}
