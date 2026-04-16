"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import type { MixBox } from "@/lib/mixBoxesDb";

function buildSearchIndex(mixes: MixBox[]): string[] {
  return mixes.map((m) => {
    const productNames = m.presets
      .map((p) => p.product?.title ?? "")
      .filter(Boolean);
    return [m.name, m.description, ...productNames]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  });
}

type SortKey = "sort_order" | "newest" | "name";

function compareMixes(a: MixBox, b: MixBox, key: SortKey): number {
  switch (key) {
    case "newest":
      return b.created_at.localeCompare(a.created_at);
    case "name":
      return a.name.localeCompare(b.name);
    case "sort_order":
    default:
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.created_at.localeCompare(b.created_at);
  }
}

export function useFilteredMixes(mixes: MixBox[]) {
  const statusFilter = useFilterBar("status");
  const searchFilter = useFilterBar("search");
  const sortFilter = useFilterBar("sort");

  const searchIndex = useMemo(() => buildSearchIndex(mixes), [mixes]);
  const deferredSearch = useDeferredValue(searchFilter.value);

  const filtered = useMemo(() => {
    const searchVal = deferredSearch.toLowerCase();
    const status = statusFilter.value;
    const sortKey = (sortFilter.value || "sort_order") as SortKey;

    const result = mixes.filter((m, i) => {
      if (status === "active" && !m.is_active) return false;
      if (status === "inactive" && m.is_active) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      return true;
    });

    return result.slice().sort((a, b) => compareMixes(a, b, sortKey));
  }, [mixes, searchIndex, statusFilter.value, sortFilter.value, deferredSearch]);

  return {
    mixes: filtered,
    statusFilter,
    searchFilter,
    sortFilter,
  };
}

export type FilteredMixes = ReturnType<typeof useFilteredMixes>;
