"use client";

import { useDeferredValue, useMemo } from "react";
import { Clock } from "lucide-react";
import {
  DataCardList,
  DataCardPagination,
  DataTable,
  EmptyState,
} from "@/shared/ui";
import { useFilterBar, useFilterBarMulti } from "@/providers";
import type { StockMovementWithProduct } from "@/lib/inventoryDb";
import { stripHtml } from "@/shared/utils/sanitizeHtml";
import { useInventoryTable } from "../useInventoryTable";
import { HistoryToolbar } from "./HistoryToolbar";
import { HistoryCard } from "./HistoryCard";
import { historyColumns } from "./columns";

interface HistoryPageInnerProps {
  movements: StockMovementWithProduct[];
  productOptions: { value: string; label: string }[];
}

export function HistoryPageInner({
  movements,
  productOptions,
}: HistoryPageInnerProps) {
  const search = useFilterBar("search");
  const reason = useFilterBarMulti("reason");
  const product = useFilterBarMulti("product");
  const deferredSearch = useDeferredValue(search.value);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const reasonSet = new Set(reason.values);
    const productSet = new Set(product.values);

    return movements.filter((m) => {
      if (reasonSet.size > 0 && !reasonSet.has(m.reason)) return false;
      if (productSet.size > 0 && !productSet.has(m.product_id)) return false;
      if (q) {
        const haystack = `${m.product_title} ${stripHtml(m.note)} ${m.order_id ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [movements, deferredSearch, reason.values, product.values]);

  const { paginatedData, sort, onSort, pagination } = useInventoryTable(
    filtered,
    historyColumns,
  );

  const hasFilters = !!(
    search.value ||
    reason.values.length ||
    product.values.length
  );
  const emptyDescription = hasFilters
    ? "Try adjusting filters to find what you're looking for."
    : "Stock movements will appear here as orders are paid or admins adjust stock.";

  return (
    <>
      <HistoryToolbar productOptions={productOptions} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-10 h-10 text-earth/20" />}
          label="No movements"
          description={emptyDescription}
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="xl:hidden">
            <DataCardList>
              {paginatedData.map((m) => (
                <HistoryCard key={m.id} movement={m} />
              ))}
            </DataCardList>
            <DataCardPagination pagination={pagination} />
          </div>

          {/* Desktop: table */}
          <div className="hidden xl:block">
            <DataTable
              data={paginatedData}
              columns={historyColumns}
              keyExtractor={(m) => m.id}
              sort={sort}
              onSort={onSort}
              pagination={pagination}
              wrapperClassName="overscroll-auto!"
              emptyIcon={<Clock className="w-10 h-10 text-earth/15" />}
              emptyLabel="No movements"
              emptyDescription={emptyDescription}
            />
          </div>
        </>
      )}
    </>
  );
}
