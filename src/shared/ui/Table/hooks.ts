"use client";

import { useState, useMemo, useCallback } from "react";
import type { SortState, SortDirection, ColumnDef } from "./types";

// ─── useTableSort ────────────────────────────────────────────────────────────

export function useTableSort<K extends string = string>(
  defaultSort?: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K> | null>(defaultSort ?? null);

  const onSort = useCallback(
    (key: K) => {
      setSort((prev) => {
        if (prev?.key === key) {
          // Toggle direction, or clear on third click
          if (prev.direction === "asc") return { key, direction: "desc" };
          return null; // clear sort
        }
        return { key, direction: "asc" as SortDirection };
      });
    },
    [],
  );

  return { sort, onSort };
}

// ─── useTableData ────────────────────────────────────────────────────────────

export function useTableData<T, K extends string = string>(
  data: T[],
  columns: ColumnDef<T, K>[],
  sort: SortState<K> | null,
) {
  return useMemo(() => {
    if (!sort) return data;

    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortable) return data;

    const compare = col.compare;
    if (!compare) return data;

    const dir = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => compare(a, b) * dir);
  }, [data, columns, sort]);
}

// ─── useTableSearch ──────────────────────────────────────────────────────────

export function useTableSearch<T>(
  data: T[],
  searchTerm: string,
  searchFn: (item: T, term: string) => boolean,
) {
  return useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return data;
    return data.filter((item) => searchFn(item, trimmed));
  }, [data, searchTerm, searchFn]);
}

// ─── useTablePagination ──────────────────────────────────────────────────────

export interface PaginationState {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

export function useTablePagination<T>(
  data: T[],
  defaultPageSize = 10,
): { paginatedData: T[]; pagination: PaginationState } {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const total = data.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Clamp page when data or pageSize changes
  const clampedPage = useMemo(
    () => Math.min(page, pageCount),
    [page, pageCount],
  );

  // Keep state in sync with clamped value
  if (clampedPage !== page) {
    setPage(clampedPage);
  }

  const paginatedData = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, clampedPage, pageSize]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, pageCount));
  }, [pageCount]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    paginatedData,
    pagination: {
      page: clampedPage,
      pageSize,
      pageCount,
      total,
      canPrev: clampedPage > 1,
      canNext: clampedPage < pageCount,
      setPage,
      nextPage,
      prevPage,
      setPageSize,
    },
  };
}
