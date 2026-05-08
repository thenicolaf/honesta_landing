"use client";

import Image from "next/image";
import { Plus, Settings2, Clock } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type ColumnDef,
} from "@/shared/ui";
import { compareNumber, compareString } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import type { InventoryRow } from "@/lib/inventoryDb";
import { useInventoryActions } from "./InventoryActionsProvider";
import {
  InventoryStatusBadge,
  formatAedPerHundred,
  formatGrams,
  stockTone,
} from "./inventoryUi";

export type InventoryColumnKey =
  | "product"
  | "stock"
  | "threshold"
  | "cost"
  | "status"
  | "actions";

const productColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "product",
  header: "Product",
  cell: (r) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
        {r.product_image_url ? (
          <Image
            src={r.product_image_url}
            alt={r.product_title}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : null}
      </div>
      <span className="font-semibold text-sm text-earth capitalize truncate">
        {r.product_title.toLowerCase()}
      </span>
    </div>
  ),
  sortable: true,
  compare: compareString((r) => r.product_title),
  headerClassName: "min-w-56",
};

const stockColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "stock",
  header: "Stock",
  cell: (r) => (
    <span
      className={cn(
        "text-sm font-semibold tabular-nums whitespace-nowrap",
        stockTone(r.status),
      )}
    >
      {formatGrams(r.stock_g)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((r) => r.stock_g),
  headerClassName: "min-w-24",
};

const thresholdColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "threshold",
  header: "Threshold",
  cell: (r) => (
    <span className="text-sm tabular-nums text-earth/70 whitespace-nowrap">
      {formatGrams(r.low_stock_threshold_g)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((r) => r.low_stock_threshold_g),
  headerClassName: "min-w-28",
};

const costColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "cost",
  header: "Cost / 100 g",
  cell: (r) => (
    <span className="text-sm tabular-nums text-earth/70 whitespace-nowrap">
      {formatAedPerHundred(r.cost_per_100g)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((r) => r.cost_per_100g),
  headerClassName: "min-w-32",
};

const statusColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "status",
  header: "Status",
  cell: (r) => <InventoryStatusBadge status={r.status} />,
  sortable: true,
  compare: compareString((r) => r.status),
  headerClassName: "min-w-24",
};

function ActionsCell({ row }: { row: InventoryRow }) {
  const { open } = useInventoryActions();
  return (
    <div className="flex items-center gap-1">
      <Tooltip side="top">
        <TooltipTrigger asChild>
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            aria-label="Adjust stock"
            onClick={() => open("adjust", row)}
          >
            <Plus size={14} aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Adjust</TooltipContent>
      </Tooltip>
      <Tooltip side="top">
        <TooltipTrigger asChild>
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            aria-label="Inventory settings"
            onClick={() => open("settings", row)}
          >
            <Settings2 size={14} aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      <Tooltip side="top">
        <TooltipTrigger asChild>
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            aria-label="Movements history"
            onClick={() => open("history", row)}
          >
            <Clock size={14} aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>History</TooltipContent>
      </Tooltip>
    </div>
  );
}

const actionsColumn: ColumnDef<InventoryRow, InventoryColumnKey> = {
  key: "actions",
  header: "",
  cell: (r) => <ActionsCell row={r} />,
  headerClassName: "w-32",
};

export const inventoryColumns: ColumnDef<InventoryRow, InventoryColumnKey>[] = [
  productColumn,
  stockColumn,
  thresholdColumn,
  costColumn,
  statusColumn,
  actionsColumn,
];
