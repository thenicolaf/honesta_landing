"use client";

import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Card,
  DataCardList,
  DataCardPagination,
  useTablePagination,
} from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import type { ProductSales } from "./types";

const PAGE_SIZE = 5;

export function ProductSalesSection({ sales }: { sales: ProductSales[] }) {
  const { paginatedData, pagination } = useTablePagination(sales, PAGE_SIZE);

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden mb-8">
        <DataCardList className="min-[30rem]:grid-cols-2">
          {paginatedData.map((p) => (
            <Card
              key={`${p.name}-${p.weight_g}`}
              padding="none"
              className="px-3 py-2.5"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-body font-semibold text-sm text-earth capitalize wrap-break-word">
                    {p.name}
                  </p>
                  <p className="text-2xs text-earth/55 tabular-nums wrap-break-word">
                    <span>{p.weight_g}g</span>
                    <span className="text-earth/30"> · </span>
                    <span>Qty {p.quantity}</span>
                  </p>
                </div>
                <span className="font-semibold text-sm text-earth tabular-nums shrink-0">
                  {formatAed(p.revenue)}
                </span>
              </div>
            </Card>
          ))}
        </DataCardList>

        {pagination.pageCount > 1 && (
          <DataCardPagination pagination={pagination} className="mt-4" />
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block mb-8">
        <Table wrapperClassName="overscroll-auto">
          <TableHeader>
            <TableHeaderRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((p) => (
              <TableRow key={`${p.name}-${p.weight_g}`}>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{p.name}</span>
                    <span className="font-body text-2xs text-earth/50 tabular-nums">
                      {p.weight_g}g
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {formatAed(p.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination.pageCount > 1 && (
          <TablePagination pagination={pagination} />
        )}
      </div>
    </>
  );
}
