"use client";

import Image from "next/image";
import {
  Card,
  CopyText,
} from "@/shared/ui";
import type { StockMovementWithProduct } from "@/lib/inventoryDb";
import { stripHtml } from "@/shared/utils/sanitizeHtml";
import {
  REASON_LABELS,
  deltaTone,
  formatSignedDelta,
} from "../inventoryUi";

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

export function HistoryCard({
  movement,
}: {
  movement: StockMovementWithProduct;
}) {
  return (
    <Card padding="none" className="px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
          {movement.product_image_url ? (
            <Image
              src={movement.product_image_url}
              alt={movement.product_title}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-earth capitalize truncate">
            {movement.product_title.toLowerCase()}
          </p>
          <p className="text-2xs text-earth/55 tabular-nums truncate">
            <span>{REASON_LABELS[movement.reason] ?? movement.reason}</span>
            {movement.order_id && (
              <>
                <span className="text-earth/30"> · </span>
                <CopyText
                  text={movement.order_id}
                  className="text-earth/55 align-baseline"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{movement.order_id.slice(0, 6)}
                </CopyText>
              </>
            )}
            <span className="text-earth/30"> · </span>
            <span>{formatStamp(movement.created_at)}</span>
          </p>
        </div>
        <span className={`${deltaTone(movement.delta_g)} shrink-0`}>
          {formatSignedDelta(movement.delta_g)}
        </span>
      </div>
      {stripHtml(movement.note) && (
        <p className="mt-2 text-2xs text-earth/70 line-clamp-2">
          {stripHtml(movement.note)}
        </p>
      )}
    </Card>
  );
}
