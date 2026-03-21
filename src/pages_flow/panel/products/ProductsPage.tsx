"use client";

import { useMemo } from "react";
import { Plus, ArrowUpDown } from "lucide-react";

import {
  Button,
  FilterBar,
  EmptyState,
  ToastFromUrl,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { ProductStatus } from "@/shared/types";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { useFilterBar } from "@/providers/FilterProvider";
import { findActivePromotion } from "@/shared/utils/calculateDiscount";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  sortBySortKey,
  type ProductSortKey,
} from "@/sections/products/utils/sortProducts";
import { ProductActionsProvider } from "./ProductActionsProvider";
import { AdminProductCard } from "./AdminProductCard";

// ─── Filter items ────────────────────────────────────────────────────────────

const STATUS_ITEMS = [
  { value: ProductStatus.DRAFT, label: "Draft" },
  { value: ProductStatus.PUBLISHED, label: "Published" },
  { value: ProductStatus.ARCHIVED, label: "Archived" },
];

const SORT_OPTIONS: {
  value: ProductSortKey;
  label: string;
  promoOnly?: boolean;
}[] = [
  { value: "", label: "Recommended" },
  { value: "promotions", label: "On Sale", promoOnly: true },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "category", label: "By Category" },
];

function AdminProductGrid({ products }: { products: AdminDbProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <AdminProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ─── ProductsPageInner ──────────────────────────────────────────────────────

interface ProductsPageInnerProps {
  products: AdminDbProduct[];
  categoryItems: { value: string; label: string }[];
  salesMap?: Record<string, number>;
}

function ProductsPageInner({
  products,
  categoryItems,
  salesMap,
}: ProductsPageInnerProps) {
  const statusFilter = useFilterBar("status");
  const categoryFilter = useFilterBar("category");
  const sortFilter = useFilterBar("sort");

  const sorted = useMemo(() => {
    const filtered = products.filter((p) => {
      if (statusFilter.value && p.status !== statusFilter.value) return false;
      if (categoryFilter.value && p.categories?.slug !== categoryFilter.value)
        return false;
      return true;
    });

    const sortKey = (sortFilter.value || "") as ProductSortKey;
    const withSortFields = filtered.map((p) => ({
      ...p,
      promotion: findActivePromotion(p.promotion_products) ?? undefined,
      totalSold: salesMap?.[p.id] ?? 0,
      category: p.categories?.name ?? "",
    }));
    return sortBySortKey(withSortFields, sortKey);
  }, [products, statusFilter.value, categoryFilter.value, sortFilter.value, salesMap]);

  const hasPromo = sorted.some((p) => p.promotion);
  const visibleSortOptions = SORT_OPTIONS.filter(
    (o) => !o.promoOnly || hasPromo,
  );

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <FilterBar {...statusFilter} items={STATUS_ITEMS} label="Status" />
        {categoryItems.length > 1 && (
          <FilterBar
            {...categoryFilter}
            items={categoryItems}
            allLabel="All Categories"
            label="Category"
          />
        )}
        <Select
          value={sortFilter.value || ""}
          onValueChange={sortFilter.onValueChange}
        >
          <SelectTrigger className="w-48 h-9 text-2xs font-body font-semibold uppercase tracking-widest">
            <ArrowUpDown size={12} className="shrink-0 mr-1.5 text-earth/40" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {visibleSortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
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
        <AdminProductGrid products={sorted} />
      )}
    </>
  );
}

// ─── ProductsPage ────────────────────────────────────────────────────────────

interface ProductsPageProps {
  products: AdminDbProduct[];
  categories: { value: string; label: string }[];
  salesMap?: Record<string, number>;
}

export function ProductsPage({
  products,
  categories,
  salesMap,
}: ProductsPageProps) {
  return (
    <ProductActionsProvider>
      <ToastFromUrl />
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

      <SearchParamsFilterProvider keys={["status", "category", "sort"]}>
        <ProductsPageInner
          products={products}
          categoryItems={categories}
          salesMap={salesMap}
        />
      </SearchParamsFilterProvider>
    </ProductActionsProvider>
  );
}
