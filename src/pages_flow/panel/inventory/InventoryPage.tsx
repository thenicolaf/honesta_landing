"use client";

import { useDeferredValue, useMemo } from "react";
import { Boxes } from "lucide-react";
import {
  DataCardList,
  DataCardPagination,
  DataTable,
  EmptyState,
} from "@/shared/ui";
import { useFilterBar } from "@/providers";
import type { InventoryRow, InventoryStatus } from "@/lib/inventoryDb";
import { InventoryActionsProvider } from "./InventoryActionsProvider";
import { InventoryToolbar } from "./InventoryToolbar";
import { InventoryCard } from "./InventoryCard";
import { inventoryColumns } from "./columns";
import { useInventoryTable } from "./useInventoryTable";

function resolveStatus(stockG: number, threshold: number): InventoryStatus {
  if (stockG <= 0) return "out";
  if (stockG < threshold) return "low";
  return "in";
}

export function InventoryPageInner({ rows }: { rows: InventoryRow[] }) {
  const search = useFilterBar("search");
  const statusFilter = useFilterBar("status");
  const deferredSearch = useDeferredValue(search.value);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const wanted = statusFilter.value as InventoryStatus | "";
    return rows
      .map((r) => ({ ...r, status: resolveStatus(r.stock_g, r.low_stock_threshold_g) }))
      .filter((r) => (q ? r.product_title.toLowerCase().includes(q) : true))
      .filter((r) => (wanted ? r.status === wanted : true));
  }, [rows, deferredSearch, statusFilter.value]);

  const { paginatedData, sort, onSort, pagination } = useInventoryTable(
    filtered,
    inventoryColumns,
  );

  const hasFilters = !!(search.value || statusFilter.value);
  const emptyDescription = hasFilters
    ? "Try adjusting filters to find what you're looking for."
    : "Publish a product to start tracking its stock here.";

  return (
    <InventoryActionsProvider>
      <InventoryToolbar />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-10 h-10 text-earth/20" />}
          label="No products"
          description={emptyDescription}
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="xl:hidden">
            <DataCardList className="sm:grid-cols-2">
              {paginatedData.map((row) => (
                <InventoryCard key={row.product_id} row={row} />
              ))}
            </DataCardList>
            <DataCardPagination pagination={pagination} />
          </div>

          {/* Desktop: table */}
          <div className="hidden xl:block">
            <DataTable
              data={paginatedData}
              columns={inventoryColumns}
              keyExtractor={(r) => r.product_id}
              sort={sort}
              onSort={onSort}
              pagination={pagination}
              wrapperClassName="overscroll-auto!"
              emptyIcon={<Boxes className="w-10 h-10 text-earth/15" />}
              emptyLabel="No products"
              emptyDescription={emptyDescription}
            />
          </div>
        </>
      )}
    </InventoryActionsProvider>
  );
}
