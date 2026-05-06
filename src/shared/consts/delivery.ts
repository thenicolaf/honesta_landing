import { format, setDay } from "date-fns";

export const MAX_DELIVERY_DAYS_AHEAD = 14;

export const WEEKDAYS_ISO = [1, 2, 3, 4, 5, 6, 7] as const;
export type WeekdayIso = (typeof WEEKDAYS_ISO)[number];

/**
 * ISO weekday (1=Mon … 7=Sun) → date-fns weekday number (0=Sun … 6=Sat).
 * Use a fixed reference week so the resulting Date always lands on the
 * intended weekday regardless of "today".
 */
const REFERENCE_WEEK = new Date(2024, 0, 1); // 2024-01-01 was a Monday
function isoWeekdayToDate(iso: WeekdayIso): Date {
  // date-fns: 0=Sun, 1=Mon, ..., 6=Sat. ISO 7 → Sunday → 0.
  return setDay(REFERENCE_WEEK, iso === 7 ? 0 : iso);
}

export function weekdayShortLabel(iso: WeekdayIso): string {
  return format(isoWeekdayToDate(iso), "EEE");
}

export function weekdayFullLabel(iso: WeekdayIso): string {
  return format(isoWeekdayToDate(iso), "EEEE");
}
