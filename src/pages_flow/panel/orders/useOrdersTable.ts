"use client";

import { useMemo, useCallback } from "react";
import { useTableData } from "@/shared/ui";
import type { SortState, SortDirection, PaginationState, ColumnDef } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";

const DEFAULT_PAGE_SIZE = 10;

export function useOrdersTable<T, K extends string>(
  data: T[],
  columns: ColumnDef<T, K>[],
) {
  const sortKeyFilter = useFilterBar("sortKey");
  const sortDirFilter = useFilterBar("sortDir");
  const pageFilter = useFilterBar("page");
  const pageSizeFilter = useFilterBar("pageSize");

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sort = useMemo<SortState<K> | null>(() => {
    const key = sortKeyFilter.value as K;
    const dir = sortDirFilter.value as SortDirection;
    if (key && (dir === "asc" || dir === "desc")) return { key, direction: dir };
    return null;
  }, [sortKeyFilter.value, sortDirFilter.value]);

  const sorted = useTableData(data, columns, sort);

  const onSort = useCallback(
    (key: K) => {
      pageFilter.onValueChange("");

      if (sort?.key === key) {
        if (sort.direction === "asc") {
          sortKeyFilter.onValueChange(key);
          sortDirFilter.onValueChange("desc");
        } else {
          sortKeyFilter.onValueChange("");
          sortDirFilter.onValueChange("");
        }
      } else {
        sortKeyFilter.onValueChange(key);
        sortDirFilter.onValueChange("asc");
      }
    },
    [sort, sortKeyFilter, sortDirFilter, pageFilter],
  );

  // ── Pagination ───────────────────────────────────────────────────────────
  const pageSize = Number(pageSizeFilter.value) || DEFAULT_PAGE_SIZE;
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rawPage = Number(pageFilter.value) || 1;
  const page = Math.min(Math.max(1, rawPage), pageCount);

  const paginatedData = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const setPage = useCallback(
    (p: number) => pageFilter.onValueChange(p > 1 ? String(p) : ""),
    [pageFilter],
  );

  const setPageSize = useCallback(
    (size: number) => {
      pageSizeFilter.onValueChange(String(size));
      pageFilter.onValueChange("");
    },
    [pageSizeFilter, pageFilter],
  );

  const pagination: PaginationState = useMemo(
    () => ({
      page,
      pageSize,
      pageCount,
      total,
      canPrev: page > 1,
      canNext: page < pageCount,
      setPage,
      nextPage: () => setPage(Math.min(page + 1, pageCount)),
      prevPage: () => setPage(Math.max(page - 1, 1)),
      setPageSize,
    }),
    [page, pageSize, pageCount, total, setPage, setPageSize],
  );

  return { paginatedData, sort, onSort, pagination };
}
