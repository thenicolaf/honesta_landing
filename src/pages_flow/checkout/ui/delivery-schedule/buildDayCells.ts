import { addDays, format, startOfDay, startOfWeek } from "date-fns";
import {
  getMinDeliveryDate,
  nowInZone,
  toDateOnlyString,
} from "@/shared/utils/zonedTime";
import { getAvailableSlotsForDate } from "@/shared/utils/deliverySlots";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";

export interface DayCell {
  date: Date;
  iso: string;
  dayOfMonth: number;
  available: boolean;
  isToday: boolean;
}

export interface DayGrid {
  cells: DayCell[];
  weekdayLabels: string[];
  earliestAvailable: DayCell | null;
}

export const WEEK_LENGTH = 7;
export const WEEKS_TO_SHOW = 2;
export const TOTAL_CELLS = WEEK_LENGTH * WEEKS_TO_SHOW;

/**
 * Builds the 2-week calendar grid anchored to the Monday of the week
 * containing the earliest available delivery date. Pure — same inputs always
 * yield the same shape, so it's safe to memoise on the call site.
 */
export function buildDayGrid(
  slots: readonly DeliverySlot[],
  blackouts: readonly DeliveryBlackout[],
  cutoffHour: number,
  deliveryDays: number = 1,
  now: Date = new Date(),
): DayGrid {
  const today = startOfDay(nowInZone(now));
  const minDate = getMinDeliveryDate(cutoffHour, now, deliveryDays);
  const gridStart = startOfWeek(minDate, { weekStartsOn: 1 });

  const cells: DayCell[] = [];
  let earliestAvailable: DayCell | null = null;

  for (let i = 0; i < TOTAL_CELLS; i += 1) {
    const date = addDays(gridStart, i);
    const isWithinWindow = date.getTime() >= minDate.getTime();
    const slotsForDate = isWithinWindow
      ? getAvailableSlotsForDate(
          date,
          slots,
          blackouts,
          cutoffHour,
          deliveryDays,
          now,
        )
      : [];
    const available = isWithinWindow && slotsForDate.length > 0;
    const cell: DayCell = {
      date,
      iso: toDateOnlyString(date),
      dayOfMonth: date.getDate(),
      available,
      isToday: date.getTime() === today.getTime(),
    };
    if (available && !earliestAvailable) earliestAvailable = cell;
    cells.push(cell);
  }

  const weekdayLabels = Array.from({ length: WEEK_LENGTH }, (_, i) =>
    format(addDays(gridStart, i), "EEEEE"),
  );

  return { cells, weekdayLabels, earliestAvailable };
}
