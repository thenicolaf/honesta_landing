import { formatLongDate } from "@/shared/utils/zonedTime";
import type { DayCell } from "./buildDayCells";

export function EarliestDeliveryHint({ cell }: { cell: DayCell | null }) {
  if (!cell) return null;
  return (
    <p className="text-2xs font-body text-earth/55">
      Earliest delivery — {formatLongDate(cell.date)}
    </p>
  );
}
