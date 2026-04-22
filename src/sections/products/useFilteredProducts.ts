"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import { findActivePromotion } from "@/shared/utils/calculateDiscount";
import { mapDbProducts, sortProducts, type ProductSortKey } from "./utils";
import type { DbProduct } from "./types";

function buildSearchIndex(products: DbProduct[]): string[] {
  return products.map((p) => {
    const tags = p.product_tags?.map((t) => t.tag_options.label) ?? [];
    return [p.title, p.tagline, p.categories?.name, ...tags]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  });
}

function matchesMark(p: DbProduct, mark: string): boolean {
  if (mark === "promotions") return !!findActivePromotion(p.promotion_products);
  if (mark === "best_seller") return p.mark === "best_seller";
  if (mark === "new") return p.mark === "new";
  return true;
}

export function useFilteredProducts(
  rawProducts: DbProduct[],
  salesMap?: Record<string, number>,
) {
  const categoryFilter = useFilterBar("category");
  const sortFilter = useFilterBar("sort");
  const searchFilter = useFilterBar("search");
  const markFilter = useFilterBar("mark");

  const sortDisabled = markFilter.value !== "";
  const effectiveSort = sortDisabled
    ? ""
    : ((sortFilter.value || "") as ProductSortKey);

  const searchIndex = useMemo(
    () => buildSearchIndex(rawProducts),
    [rawProducts],
  );

  const deferredSearch = useDeferredValue(searchFilter.value);

  const products = useMemo(() => {
    const searchVal = deferredSearch.toLowerCase();
    const category = categoryFilter.value;
    const mark = markFilter.value;

    const filtered = rawProducts.filter((p, i) => {
      if (category && p.categories?.slug !== category) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      if (mark && !matchesMark(p, mark)) return false;
      return true;
    });

    return sortProducts(mapDbProducts(filtered, salesMap), effectiveSort);
  }, [
    rawProducts,
    salesMap,
    searchIndex,
    categoryFilter.value,
    effectiveSort,
    deferredSearch,
    markFilter.value,
  ]);

  return {
    products,
    sortDisabled,
    categoryFilter,
    sortFilter,
    searchFilter,
    markFilter,
  };
}

export type FilteredProducts = ReturnType<typeof useFilteredProducts>;
