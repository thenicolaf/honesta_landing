"use client";

import Image from "next/image";
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
  Badge,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
  useTablePagination,
} from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { formatAed } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import type { MixSales, MixPresetSales } from "./types";

const PAGE_SIZE = 5;

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

function PresetList({ presets, className }: { presets: MixPresetSales[]; className?: string }) {
  if (presets.length === 0) return null;

  return (
    <Collapsible className={cn("mt-1", className)}>
      <CollapsibleTrigger
        onClick={stop}
        className="inline-flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors"
      >
        Presets · {presets.length}
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-2 mt-2 pb-2 pr-1">
          {presets.map((p, i) => (
            <li
              key={`${p.name}-${p.weight_g}-${i}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5"
            >
              <div className="relative shrink-0 w-9 h-9">
                <div className="absolute inset-0 rounded-lg bg-sand overflow-hidden">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-earth/30">
                      <IconLeaf className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <Badge
                  variant="counter"
                  size="pill"
                  className="absolute -bottom-1.5 -right-1.5 px-1.5! py-0.5! text-[0.55rem]! leading-none!"
                >
                  ×{p.count}
                </Badge>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-body font-medium text-xs text-earth capitalize truncate">
                  {p.name}
                </span>
                <span className="font-body font-light text-2xs text-earth/55 tabular-nums">
                  {p.weight_g}g · {p.count}× sold
                </span>
              </div>

              <span className="font-body font-semibold text-xs text-earth whitespace-nowrap tabular-nums">
                {formatAed(p.revenue)}
              </span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MixSalesSection({ sales }: { sales: MixSales[] }) {
  const { paginatedData, pagination } = useTablePagination(sales, PAGE_SIZE);

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden mb-8">
        <DataCardList className="min-[30rem]:grid-cols-2">
          {paginatedData.map((m) => (
            <DataCard key={m.name}>
              <DataCardHeader>
                <span className="font-body font-semibold text-sm text-earth">
                  {m.name}
                </span>
              </DataCardHeader>
              <DataCardBody>
                <DataCardField label="Quantity">
                  <span className="tabular-nums">{m.quantity}</span>
                </DataCardField>
                <DataCardField label="Revenue">
                  <span className="font-semibold tabular-nums">
                    {formatAed(m.revenue)}
                  </span>
                </DataCardField>
              </DataCardBody>
              <div className="px-4 pb-3">
                <PresetList presets={m.presets} />
              </div>
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
              <TableHead className="min-w-80">Mix</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((m) => (
              <TableRow key={m.name}>
                <TableCell className="min-w-80 align-top">
                  <div className="flex flex-col">
                    <span>{m.name}</span>
                    <PresetList presets={m.presets} />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums align-top">
                  {m.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold align-top">
                  {formatAed(m.revenue)}
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
