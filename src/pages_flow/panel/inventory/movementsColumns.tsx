"use client";

import { CopyText, type ColumnDef } from "@/shared/ui";
import { compareDate, compareNumber, compareString } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import type { StockMovement } from "@/lib/inventoryDb";
import { stripHtml } from "@/shared/utils/sanitizeHtml";
import {
  REASON_LABELS,
  deltaTone,
  formatSignedDelta,
} from "./inventoryUi";

export type MovementColumnKey = "date" | "reason" | "delta" | "note";

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

const dateColumn: ColumnDef<StockMovement, MovementColumnKey> = {
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

const reasonColumn: ColumnDef<StockMovement, MovementColumnKey> = {
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

const deltaColumn: ColumnDef<StockMovement, MovementColumnKey> = {
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

const noteColumn: ColumnDef<StockMovement, MovementColumnKey> = {
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
  headerClassName: "min-w-48",
};

export const movementsColumns: ColumnDef<StockMovement, MovementColumnKey>[] = [
  dateColumn,
  reasonColumn,
  deltaColumn,
  noteColumn,
];
