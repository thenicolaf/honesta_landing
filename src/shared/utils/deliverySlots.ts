import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import { getMinDeliveryDate, getZoneIsoWeekday, nowInZone } from "./zonedTime";

function padTime(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}

export interface DeliverySlotShape {
  id: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: number[];
}

export interface DeliveryBlackoutShape {
  blackout_date: string;
  slot_id: string | null;
}

/**
 * Pure resolver — used by both server (revalidate at submit) and client
 * (render the date strip / slot tiles in checkout). No DB or React imports.
 */
export function getAvailableSlotsForDate<
  TSlot extends DeliverySlotShape,
  TBlackout extends DeliveryBlackoutShape,
>(
  date: Date,
  slots: readonly TSlot[],
  blackouts: readonly TBlackout[],
  cutoffHour: number,
  deliveryDays: number = 1,
  now: Date = new Date(),
): TSlot[] {
  const minDate = getMinDeliveryDate(cutoffHour, now, deliveryDays);
  if (isBefore(date, minDate)) return [];

  const sameDayBlackouts = blackouts.filter((b) =>
    isSameDay(new Date(`${b.blackout_date}T00:00:00`), date),
  );
  const fullDayBlocked = sameDayBlackouts.some((b) => b.slot_id == null);
  if (fullDayBlocked) return [];

  const blockedSlotIds = new Set(
    sameDayBlackouts
      .filter((b) => b.slot_id != null)
      .map((b) => b.slot_id as string),
  );

  const isoWeekday = getZoneIsoWeekday(date);
  const isToday = isSameDay(date, startOfDay(nowInZone(now)));
  const nowTimeOfDay = isToday ? format(nowInZone(now), "HH:mm:ss") : null;

  return [...slots]
    .filter((s) => s.is_active)
    .filter((s) => s.available_weekdays.includes(isoWeekday))
    .filter((s) => !blockedSlotIds.has(s.id))
    .filter((s) => !isToday || padTime(s.end_time) > nowTimeOfDay!)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export interface SlotConflictShape {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: number[];
}

export interface SlotConflict<T> {
  slot: T;
  weekday: number;
}

/**
 * Two active slots can't overlap in time on any shared weekday.
 * Time strings "HH:MM[:SS]" compare lexicographically — matches numeric
 * ordering for same-day intervals.
 */
export function findSlotConflict<T extends SlotConflictShape>(
  newStart: string,
  newEnd: string,
  newWeekdays: readonly number[],
  existing: readonly T[],
  excludeId?: string,
): SlotConflict<T> | null {
  for (const slot of existing) {
    if (slot.id === excludeId) continue;
    if (!slot.is_active) continue;
    const sharedWeekday = newWeekdays.find((w) =>
      slot.available_weekdays.includes(w),
    );
    if (sharedWeekday === undefined) continue;
    const overlaps = newStart < slot.end_time && newEnd > slot.start_time;
    if (overlaps) return { slot, weekday: sharedWeekday };
  }
  return null;
}
