"use client";

import Image from "next/image";
import { CopyText, type ColumnDef } from "@/shared/ui";
import { compareDate, compareNumber, compareString } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import type { StockMovementWithProduct } from "@/lib/inventoryDb";
import { stripHtml } from "@/shared/utils/sanitizeHtml";
import { REASON_LABELS, deltaTone, formatSignedDelta } from "../inventoryUi";

export type HistoryColumnKey = "date" | "product" | "reason" | "delta" | "note";

function formatStamp(value: string): string {
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const dateColumn: ColumnDef<StockMovementWithProduct, HistoryColumnKey> = {
  key: "date",
  header: "Date",
  cell: (m) => (
    <span className="whitespace-nowrap text-2xs text-earth/55 tabular-nums">
      {formatStamp(m.created_at)}
    </span>
  ),
  sortable: true,
  compare: compareDate((m) => m.created_at),
  headerClassName: "min-w-32",
};

const productColumn: ColumnDef<StockMovementWithProduct, HistoryColumnKey> = {
  key: "product",
  header: "Product",
  cell: (m) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
        {m.product_image_url ? (
          <Image
            src={m.product_image_url}
            alt={m.product_title}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : null}
      </div>
      <span className="font-semibold text-sm text-earth capitalize truncate">
        {m.product_title.toLowerCase()}
      </span>
    </div>
  ),
  sortable: true,
  compare: compareString((m) => m.product_title),
  headerClassName: "min-w-56",
};

const reasonColumn: ColumnDef<StockMovementWithProduct, HistoryColumnKey> = {
  key: "reason",
  header: "Reason",
  cell: (m) => (
    <span className="whitespace-nowrap text-2xs">
      <span className="text-earth">{REASON_LABELS[m.reason] ?? m.reason}</span>
      {m.order_id && (
        <>
          <span className="text-earth/40"> · </span>
          <CopyText
            text={m.order_id}
            className="text-earth/40 align-baseline"
            onClick={(e) => e.stopPropagation()}
          >
            #{m.order_id.slice(0, 6)}
          </CopyText>
        </>
      )}
    </span>
  ),
  sortable: true,
  compare: compareString((m) => m.reason),
  headerClassName: "min-w-36",
};

const deltaColumn: ColumnDef<StockMovementWithProduct, HistoryColumnKey> = {
  key: "delta",
  header: "Δ",
  cell: (m) => (
    <span className={cn(deltaTone(m.delta_g), "whitespace-nowrap")}>
      {formatSignedDelta(m.delta_g)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((m) => m.delta_g),
  headerClassName: "text-right! min-w-28",
  cellClassName: "text-right",
};

const noteColumn: ColumnDef<StockMovementWithProduct, HistoryColumnKey> = {
  key: "note",
  header: "Note",
  cell: (m) => {
    const text = stripHtml(m.note);
    return text ? (
      <span className="text-2xs text-earth/70 line-clamp-2">{text}</span>
    ) : (
      <span className="text-2xs text-earth/25">—</span>
    );
  },
  headerClassName: "min-w-64",
};

export const historyColumns: ColumnDef<
  StockMovementWithProduct,
  HistoryColumnKey
>[] = [dateColumn, productColumn, reasonColumn, deltaColumn, noteColumn];
