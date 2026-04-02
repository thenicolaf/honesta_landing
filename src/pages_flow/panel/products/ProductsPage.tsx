"use client";

import { useMemo } from "react";
import { Plus, ArrowUpDown, Search } from "lucide-react";

import {
  Button,
  EmptyState,
  FormInput,
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
  const searchFilter = useFilterBar("search");

  const sorted = useMemo(() => {
    const searchVal = searchFilter.value.toLowerCase();

    const filtered = products.filter((p) => {
      if (statusFilter.value && p.status !== statusFilter.value) return false;
      if (categoryFilter.value && p.categories?.slug !== categoryFilter.value) return false;
      if (searchVal) {
        const tags = p.product_tags?.map((t) => t.tag_options.label) ?? [];
        const haystack = [p.title, p.tagline, p.categories?.name, ...tags]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(searchVal)) return false;
      }
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
  }, [products, statusFilter.value, categoryFilter.value, sortFilter.value, searchFilter.value, salesMap]);

  const hasPromo = sorted.some((p) => p.promotion);
  const visibleSortOptions = SORT_OPTIONS.filter(
    (o) => !o.promoOnly || hasPromo,
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <FormInput
          type="text"
          placeholder="Search by name, tag, category..."
          value={searchFilter.value}
          onChange={(e) => searchFilter.onValueChange(e.target.value)}
          clearable
          onClear={() => searchFilter.onValueChange("")}
          startIcon={<Search size={14} />}
          wrapperClassName="w-full sm:flex-1"
          className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />

        <Select
          value={statusFilter.value}
          onValueChange={statusFilter.onValueChange}
          clearable
        >
          <SelectTrigger className="w-full sm:w-44 h-9 text-2xs font-body font-semibold uppercase tracking-widest">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {categoryItems.length > 1 && (
          <Select
            value={categoryFilter.value}
            onValueChange={categoryFilter.onValueChange}
            options={categoryItems}
            clearable
          >
            <SelectTrigger className="w-full sm:w-56 h-9 text-2xs font-body font-semibold uppercase tracking-widest">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {(options) =>
                options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        )}

        <Select
          value={sortFilter.value || ""}
          onValueChange={sortFilter.onValueChange}
        >
          <SelectTrigger className="w-full sm:w-48 h-9 text-2xs font-body font-semibold uppercase tracking-widest">
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

      <SearchParamsFilterProvider keys={["status", "category", "sort", "search"]}>
        <ProductsPageInner
          products={products}
          categoryItems={categories}
          salesMap={salesMap}
        />
      </SearchParamsFilterProvider>
    </ProductActionsProvider>
  );
}
