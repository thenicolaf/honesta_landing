"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DataTable,
  Loader,
  useTableData,
  useTablePagination,
  useTableSort,
} from "@/shared/ui";
import type { InventoryRow, StockMovement } from "@/lib/inventoryDb";
import { loadMovementsAction } from "./actions";
import { movementsColumns, type MovementColumnKey } from "./movementsColumns";

// ─── Module-level cache ──────────────────────────────────────────────
// Caches last fetch per product_id. Survives dialog unmount, so reopening
// the same product is instant. `invalidateMovementsCache(productId)` is
// called from AdjustStockForm after a successful adjustment.

const cache = new Map<string, StockMovement[]>();

export function invalidateMovementsCache(productId: string) {
  cache.delete(productId);
}

// ─── Component ───────────────────────────────────────────────────────

interface MovementsHistoryProps {
  row: InventoryRow;
}

export function MovementsHistory({ row }: MovementsHistoryProps) {
  const cached = cache.get(row.product_id);
  const [movements, setMovements] = useState<StockMovement[]>(cached ?? []);
  const [loaded, setLoaded] = useState<boolean>(cached !== undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (cache.has(row.product_id)) return;
    startTransition(async () => {
      try {
        const result = await loadMovementsAction(row.product_id);
        cache.set(row.product_id, result.movements);
        setMovements(result.movements);
      } catch (err) {
        console.error("MovementsHistory load error:", err);
      } finally {
        setLoaded(true);
      }
    });
  }, [row.product_id]);

  const { sort, onSort } = useTableSort<MovementColumnKey>();
  const sorted = useTableData(movements, movementsColumns, sort);
  const { paginatedData, pagination } = useTablePagination(sorted, 10);

  if (!loaded || (isPending && movements.length === 0)) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <p className="py-10 text-center font-body text-sm text-earth/55">
        No movements yet for {row.product_title}.
      </p>
    );
  }

  return (
    <DataTable
      data={paginatedData}
      columns={movementsColumns}
      keyExtractor={(m) => m.id}
      sort={sort}
      onSort={onSort}
      pagination={pagination}
      wrapperClassName="overscroll-auto!"
    />
  );
}
