"use client";

import { useEffect, useRef, startTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterProvider, useFilter } from "./FilterProvider";
import type { FilterValues } from "./FilterProvider";

// ─── SearchParamsSync ────────────────────────────────────────────────────────

function SearchParamsSync({ keys }: { keys: string[] }) {
  const { filters, setFilter } = useFilter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitial = useRef(true);

  // Sync URL → state on search params change (e.g. browser back/forward, link navigation)
  useEffect(() => {
    for (const key of keys) {
      const urlValue = searchParams.get(key) ?? "";
      if (urlValue !== (filters[key] ?? "")) {
        setFilter(key, urlValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync state → URL when filters change (skip initial render)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      for (const key of keys) {
        const value = filters[key] ?? "";
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return null;
}

// ─── SearchParamsFilterProvider ──────────────────────────────────────────────

interface SearchParamsFilterProviderProps {
  keys: string[];
  children: React.ReactNode;
}

export function SearchParamsFilterProvider({
  keys,
  children,
}: SearchParamsFilterProviderProps) {
  const searchParams = useSearchParams();

  const initialValues: FilterValues = {};
  for (const key of keys) {
    const val = searchParams.get(key);
    if (val) initialValues[key] = val;
  }

  return (
    <FilterProvider initialValues={initialValues}>
      <SearchParamsSync keys={keys} />
      {children}
    </FilterProvider>
  );
}
