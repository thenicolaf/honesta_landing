"use client";

import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DataTable, DataCardPagination, useTableSort, useTableData, useTablePagination } from "@/shared/ui";
import { IconReceipt } from "@/shared/icons";
import { userOrderColumns } from "./columns";
import { OrderCards } from "./ui/OrderCards";
import type { Order } from "./types";

export function OrdersPage({ orders }: { orders: Order[] }) {
  const { sort, onSort } = useTableSort();
  const sorted = useTableData(orders, userOrderColumns, sort);
  const { paginatedData, pagination } = useTablePagination(sorted);

  return (
    <>
      <AdminPageHeader title="My Orders" />

      {/* Mobile: cards */}
      <div className="xl:hidden">
        <OrderCards orders={paginatedData} />
        <DataCardPagination pagination={pagination} />
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block">
        <DataTable
          data={paginatedData}
          columns={userOrderColumns}
          keyExtractor={(o) => o.id}
          sort={sort}
          onSort={onSort}
          pagination={pagination}
          wrapperClassName="max-h-[70vh]"
          emptyIcon={<IconReceipt className="w-10 h-10 text-earth/15" />}
          emptyLabel="No orders yet"
          emptyDescription="Your completed orders will appear here once you make a purchase."
        />
      </div>
    </>
  );
}
