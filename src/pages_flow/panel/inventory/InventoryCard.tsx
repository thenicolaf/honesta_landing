"use client";

import Image from "next/image";
import { Plus, Settings2, Clock } from "lucide-react";
import {
  Button,
  DataCard,
  DataCardBody,
  DataCardFooter,
  DataCardHeader,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { InventoryRow } from "@/lib/inventoryDb";
import { useInventoryActions } from "./InventoryActionsProvider";
import {
  InventoryStatusBadge,
  formatAedPerHundred,
  formatGrams,
  stockTone,
} from "./inventoryUi";

export function InventoryCard({ row }: { row: InventoryRow }) {
  const { open } = useInventoryActions();
  return (
    <DataCard className="flex flex-col">
      <DataCardHeader>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
            {row.product_image_url ? (
              <Image
                src={row.product_image_url}
                alt={row.product_title}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : null}
          </div>
          <p className="font-semibold text-sm text-earth capitalize truncate">
            {row.product_title.toLowerCase()}
          </p>
        </div>
        <InventoryStatusBadge status={row.status} />
      </DataCardHeader>

      <DataCardBody className="gap-0 flex-1">
        <div className="flex flex-col gap-1 text-2xs">
          <div className="flex items-center justify-between">
            <span className="text-earth/50">Stock</span>
            <span
              className={cn("tabular-nums font-semibold", stockTone(row.status))}
            >
              {formatGrams(row.stock_g)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-earth/50">Threshold</span>
            <span className="tabular-nums text-earth/70">
              {formatGrams(row.low_stock_threshold_g)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-earth/50">Cost / 100 g</span>
            <span className="tabular-nums text-earth/70">
              {formatAedPerHundred(row.cost_per_100g)}
            </span>
          </div>
        </div>
      </DataCardBody>

      <DataCardFooter className="flex flex-wrap items-center gap-2">
        <Button
          as="button"
          type="button"
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} aria-hidden="true" />}
          onClick={() => open("adjust", row)}
        >
          Adjust
        </Button>
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          startIcon={<Settings2 size={14} aria-hidden="true" />}
          onClick={() => open("settings", row)}
        >
          Settings
        </Button>
        <Button
          as="button"
          type="button"
          variant="text"
          size="sm"
          startIcon={<Clock size={14} aria-hidden="true" />}
          onClick={() => open("history", row)}
        >
          History
        </Button>
      </DataCardFooter>
    </DataCard>
  );
}
