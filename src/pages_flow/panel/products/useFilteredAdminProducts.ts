"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import { findActivePromotion } from "@/shared/utils/calculateDiscount";
import {
  sortBySortKey,
  type ProductSortKey,
} from "@/sections/products/utils/sortProducts";
import type { AdminDbProduct } from "@/lib/productsDb";

function buildSearchIndex(products: AdminDbProduct[]): string[] {
  return products.map((p) => {
    const tags = p.product_tags?.map((t) => t.tag_options.label) ?? [];
    return [p.title, p.tagline, p.categories?.name, ...tags]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  });
}

function matchesMark(p: AdminDbProduct, mark: string): boolean {
  if (mark === "promotions") return !!findActivePromotion(p.promotion_products);
  if (mark === "best_seller") return p.mark === "best_seller";
  if (mark === "new") return p.mark === "new";
  return true;
}

export function useFilteredAdminProducts(products: AdminDbProduct[]) {
  const statusFilter = useFilterBar("status");
  const categoryFilter = useFilterBar("category");
  const sortFilter = useFilterBar("sort");
  const searchFilter = useFilterBar("search");
  const markFilter = useFilterBar("mark");

  const sortDisabled = markFilter.value !== "";
  const effectiveSort = sortDisabled
    ? ""
    : ((sortFilter.value || "") as ProductSortKey);

  const searchIndex = useMemo(
    () => buildSearchIndex(products),
    [products],
  );

  const deferredSearch = useDeferredValue(searchFilter.value);

  const sorted = useMemo(() => {
    const searchVal = deferredSearch.toLowerCase();
    const status = statusFilter.value;
    const category = categoryFilter.value;
    const mark = markFilter.value;

    const filtered = products.filter((p, i) => {
      if (status && p.status !== status) return false;
      if (category && p.categories?.slug !== category) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      if (mark && !matchesMark(p, mark)) return false;
      return true;
    });

    const withSortFields = filtered.map((p) => ({
      ...p,
      promotion: findActivePromotion(p.promotion_products) ?? undefined,
      category: p.categories?.name ?? "",
    }));
    return sortBySortKey(withSortFields, effectiveSort);
  }, [
    products,
    searchIndex,
    statusFilter.value,
    categoryFilter.value,
    effectiveSort,
    deferredSearch,
    markFilter.value,
  ]);

  return {
    products: sorted,
    sortDisabled,
    statusFilter,
    categoryFilter,
    sortFilter,
    searchFilter,
    markFilter,
  };
}

export type FilteredAdminProducts = ReturnType<typeof useFilteredAdminProducts>;
