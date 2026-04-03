"use client";

import { useMemo } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DataTable, DataCardPagination } from "@/shared/ui";
import { IconReceipt } from "@/shared/icons";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { useFilterBar } from "@/providers/FilterProvider";
import { adminOrderColumns } from "@/pages_flow/orders/columns";
import type { AdminOrder } from "@/pages_flow/orders/types";
import { filterOrders } from "./helpers";
import { useOrdersTable } from "./useOrdersTable";
import { useRealtimeOrders } from "./useRealtimeOrders";
import { OrderFilters } from "./OrderFilters";
import { AdminOrderCards } from "./AdminOrderCards";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_KEYS = [
  "search",
  "status",
  "fulfilled",
  "sortKey",
  "sortDir",
  "page",
  "pageSize",
];

// ─── Inner (consumes filter context) ──────────────────────────────────────────

function AllOrdersInner({ orders: initial }: { orders: AdminOrder[] }) {
  const orders = useRealtimeOrders(initial);
  const searchFilter = useFilterBar("search");
  const statusFilter = useFilterBar("status");
  const fulfilledFilter = useFilterBar("fulfilled");

  const filtered = useMemo(
    () =>
      filterOrders(
        orders,
        statusFilter.value,
        searchFilter.value,
        fulfilledFilter.value,
      ),
    [orders, statusFilter.value, searchFilter.value, fulfilledFilter.value],
  );

  const { paginatedData, sort, onSort, pagination } = useOrdersTable(
    filtered,
    adminOrderColumns,
  );

  const hasFilters = !!(
    searchFilter.value ||
    statusFilter.value ||
    fulfilledFilter.value
  );

  const emptyDescription = hasFilters
    ? "Try adjusting filters to find what you're looking for."
    : "Customer orders will appear here once purchases are made.";

  return (
    <>
      <OrderFilters />

      {/* Mobile: cards */}
      <div className="xl:hidden">
        <AdminOrderCards
          orders={paginatedData}
          emptyDescription={emptyDescription}
        />
        <DataCardPagination pagination={pagination} />
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block">
        <DataTable
          data={paginatedData}
          columns={adminOrderColumns}
          keyExtractor={(o) => o.id}
          sort={sort}
          onSort={onSort}
          pagination={pagination}
          wrapperClassName="max-h-[70vh]"
          emptyIcon={<IconReceipt className="w-10 h-10 text-earth/15" />}
          emptyLabel="No orders found"
          emptyDescription={emptyDescription}
        />
      </div>
    </>
  );
}

// ─── AllOrdersPage ────────────────────────────────────────────────────────────

export function AllOrdersPage({ orders }: { orders: AdminOrder[] }) {
  return (
    <>
      <AdminPageHeader title="All Orders" />

      <SearchParamsFilterProvider keys={FILTER_KEYS}>
        <AllOrdersInner orders={orders} />
      </SearchParamsFilterProvider>
    </>
  );
}
