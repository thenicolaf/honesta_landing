"use client";

import { createContext, use, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterValues = Record<string, string>;

interface FilterContextValue {
  filters: FilterValues;
  getFilter: (key: string) => string;
  setFilter: (key: string, value: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const FilterContext = createContext<FilterContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface FilterProviderProps {
  children: React.ReactNode;
  initialValues?: FilterValues;
}

export function FilterProvider({ children, initialValues = {} }: FilterProviderProps) {
  const [filters, setFilters] = useState<FilterValues>(initialValues);

  const getFilter = useCallback(
    (key: string) => filters[key] ?? "",
    [filters],
  );

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <FilterContext value={{ filters, getFilter, setFilter }}>
      {children}
    </FilterContext>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useFilter() {
  const ctx = use(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}

export function useFilterBar(key: string) {
  const { getFilter, setFilter } = useFilter();
  return {
    value: getFilter(key),
    onValueChange: (v: string) => setFilter(key, v),
  };
}

export function useFilterBarMulti(key: string) {
  const { getFilter, setFilter } = useFilter();
  const raw = getFilter(key);
  return {
    values: raw ? raw.split(",") : [],
    onValuesChange: (v: string[]) => setFilter(key, v.join(",")),
  };
}
