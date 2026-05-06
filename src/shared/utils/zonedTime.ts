import { addDays, format, getISODay, startOfDay } from "date-fns";

const DEFAULT_TIMEZONE = "Asia/Dubai";

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let cached = partsFormatterCache.get(timeZone);
  if (!cached) {
    cached = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    partsFormatterCache.set(timeZone, cached);
  }
  return cached;
}

function wallClockIn(timeZone: string, at: Date = new Date()): Date {
  const parts = getPartsFormatter(timeZone)
    .formatToParts(at)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`,
  );
}

export function nowInZone(
  at: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): Date {
  return wallClockIn(timeZone, at);
}

export function isPastCutoff(
  cutoffHour: number,
  at: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): boolean {
  return wallClockIn(timeZone, at).getHours() >= cutoffHour;
}

/**
 * Earliest deliverable date considering both `delivery_days` lead time and the
 * daily `cutoff_hour`. Lead time always pushes the date by `deliveryDays` days
 * (default 1 = next-day delivery). Cut-off bumps it by 1 extra day if the
 * order is placed past the hour.
 */
export function getMinDeliveryDate(
  cutoffHour: number,
  at: Date = new Date(),
  deliveryDays: number = 1,
  timeZone: string = DEFAULT_TIMEZONE,
): Date {
  const today = startOfDay(wallClockIn(timeZone, at));
  const leadDays = Math.max(1, deliveryDays);
  const offset = leadDays + (isPastCutoff(cutoffHour, at, timeZone) ? 1 : 0);
  return addDays(today, offset);
}

export function getZoneIsoWeekday(date: Date): number {
  return getISODay(date);
}

export function formatLongDate(date: Date): string {
  return format(date, "d MMMM yyyy");
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)}–${endTime.slice(0, 5)}`;
}

export interface DeliverySlotSnapshot {
  label: string;
  start_time: string;
  end_time: string;
}

export function formatDeliverySchedule(
  date: Date,
  slot: DeliverySlotSnapshot,
): string {
  return `${formatLongDate(date)} · ${slot.label} ${formatTimeRange(
    slot.start_time,
    slot.end_time,
  )}`;
}

export function toDateOnlyString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromDateOnlyString(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
