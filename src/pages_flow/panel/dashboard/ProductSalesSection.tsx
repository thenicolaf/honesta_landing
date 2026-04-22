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
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardField,
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
            <DataCard key={`${p.name}-${p.weight_g}`}>
              <DataCardHeader>
                <span className="font-body font-semibold text-sm text-earth">
                  {p.name}
                </span>
              </DataCardHeader>
              <DataCardBody>
                <DataCardField label="Weight">
                  <span className="tabular-nums">{p.weight_g}g</span>
                </DataCardField>
                <DataCardField label="Quantity">
                  <span className="tabular-nums">{p.quantity}</span>
                </DataCardField>
                <DataCardField label="Revenue">
                  <span className="font-semibold tabular-nums">
                    {formatAed(p.revenue)}
                  </span>
                </DataCardField>
              </DataCardBody>
            </DataCard>
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
