import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import {
  WEEKDAYS_ISO,
  weekdayShortLabel,
  type WeekdayIso,
} from "@/shared/consts/delivery";

interface Interval {
  start: string;
  end: string;
}

const DAY_END = "24:00";
const DAY_START = "00:00";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start),
  );
  const out: Interval[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const tail = out[out.length - 1];
    const next = sorted[i];
    if (toMinutes(next.start) <= toMinutes(tail.end)) {
      if (toMinutes(next.end) > toMinutes(tail.end)) tail.end = next.end;
    } else {
      out.push(next);
    }
  }
  return out;
}

function invertIntervals(intervals: Interval[]): Interval[] {
  const merged = mergeIntervals(intervals);
  const free: Interval[] = [];
  let cursor = DAY_START;
  for (const i of merged) {
    if (toMinutes(i.start) > toMinutes(cursor)) {
      free.push({ start: cursor, end: i.start });
    }
    cursor = i.end;
  }
  if (toMinutes(cursor) < toMinutes(DAY_END)) {
    free.push({ start: cursor, end: DAY_END });
  }
  return free;
}

export interface FreeWindow {
  weekday: WeekdayIso;
  free: Interval[];
}

export function computeFreeWindows(
  selectedWeekdays: readonly number[],
  existing: readonly DeliverySlot[],
  excludeId?: string,
): FreeWindow[] {
  return WEEKDAYS_ISO.filter((d) => selectedWeekdays.includes(d)).map(
    (weekday) => {
      const occupied = existing
        .filter((s) => s.id !== excludeId)
        .filter((s) => s.is_active)
        .filter((s) => s.available_weekdays.includes(weekday))
        .map<Interval>((s) => ({
          start: s.start_time.slice(0, 5),
          end: s.end_time.slice(0, 5) === "00:00" ? DAY_END : s.end_time.slice(0, 5),
        }));
      return { weekday, free: invertIntervals(occupied) };
    },
  );
}

export function formatFreeWindow(window: FreeWindow): string {
  if (window.free.length === 0) return "fully booked";
  return window.free
    .map((i) => `${fromMinutes(toMinutes(i.start))}–${fromMinutes(toMinutes(i.end))}`)
    .join(", ");
}

export function formatFreeWindowsLabel(windows: FreeWindow[]): {
  text: string;
  hasFullyBlocked: boolean;
} {
  if (windows.length === 0)
    return { text: "Pick weekdays", hasFullyBlocked: false };
  const parts = windows.map(
    (w) => `${weekdayShortLabel(w.weekday)} ${formatFreeWindow(w)}`,
  );
  const hasFullyBlocked = windows.some((w) => w.free.length === 0);
  return { text: parts.join(" · "), hasFullyBlocked };
}
