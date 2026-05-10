"use client";

import { DataTable, DataCardPagination } from "@/shared/ui";
import { IconReceipt } from "@/shared/icons";
import { adminOrderColumns } from "@/pages_flow/orders/columns";
import type { AdminOrder } from "@/pages_flow/orders/types";
import { useFilteredOrders } from "./useFilteredOrders";
import { useOrdersTable } from "./useOrdersTable";
import { useAutoRouterRefresh } from "@/shared/hooks/useAutoRouterRefresh";
import { OrderFilters } from "./OrderFilters";
import { AdminOrderCards } from "./AdminOrderCards";

export function AllOrdersInner({ orders }: { orders: AdminOrder[] }) {
  useAutoRouterRefresh(["panel-orders-refresh"]);

  const { filtered, searchFilter, statusFilter, fulfilledFilter } =
    useFilteredOrders(orders);

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
