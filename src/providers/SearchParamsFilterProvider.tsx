"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterProvider, useFilter } from "./FilterProvider";
import type { FilterValues } from "./FilterProvider";

// ─── SearchParamsSync ────────────────────────────────────────────────────────

function SearchParamsSync({ keys, multiKeys = [] }: { keys: string[]; multiKeys?: string[] }) {
  const { filters, setFilter } = useFilter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitial = useRef(true);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const updatingUrl = useRef(false);

  // Sync state → URL (must be BEFORE URL → state to set updatingUrl flag first)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    updatingUrl.current = true;

    const params = new URLSearchParams(searchParams.toString());

    for (const key of keys) {
      params.delete(key);
      if (multiKeys.includes(key)) {
        const vals = (filters[key] ?? "").split(",").filter(Boolean);
        vals.forEach((v) => params.append(key, v));
      } else {
        const value = filters[key] ?? "";
        if (value) params.set(key, value);
      }
    }

    const qs = params.toString();
    const hash = window.location.hash;
    const url = qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;

    // Sync URL immediately so other code (e.g. HashTracker) sees current search params
    window.history.replaceState(null, "", url);
    router.replace(url, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Sync URL → state (browser back/forward, external navigation)
  useEffect(() => {
    if (updatingUrl.current) {
      const current = filtersRef.current;
      const synced = keys.every((key) => {
        const urlValue = multiKeys.includes(key)
          ? searchParams.getAll(key).join(",")
          : searchParams.get(key) ?? "";
        return urlValue === (current[key] ?? "");
      });
      if (synced) updatingUrl.current = false;
      return;
    }

    const current = filtersRef.current;
    for (const key of keys) {
      const urlValue = multiKeys.includes(key)
        ? searchParams.getAll(key).join(",")
        : searchParams.get(key) ?? "";
      if (urlValue !== (current[key] ?? "")) {
        setFilter(key, urlValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

// ─── SearchParamsFilterProvider ──────────────────────────────────────────────

interface SearchParamsFilterProviderProps {
  keys: string[];
  multiKeys?: string[];
  children: React.ReactNode;
}

export function SearchParamsFilterProvider({
  keys,
  multiKeys = [],
  children,
}: SearchParamsFilterProviderProps) {
  const searchParams = useSearchParams();

  const initialValues: FilterValues = {};
  for (const key of keys) {
    if (multiKeys.includes(key)) {
      const vals = searchParams.getAll(key).join(",");
      if (vals) initialValues[key] = vals;
    } else {
      const val = searchParams.get(key);
      if (val) initialValues[key] = val;
    }
  }

  return (
    <FilterProvider initialValues={initialValues}>
      <SearchParamsSync keys={keys} multiKeys={multiKeys} />
      {children}
    </FilterProvider>
  );
}
