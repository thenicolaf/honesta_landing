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
  emirates?: readonly string[];
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

// ─── Emirate scoping ────────────────────────────────────────────────────────
//
// `emirates` on a slot holds `delivery_settings.emirate` names. Empty array =
// "all emirates" — the default schedule. An emirate with at least one ACTIVE
// slot of its own ignores the default schedule entirely (override model).
// Stopping deliveries to an emirate is done by deactivating the emirate in
// `delivery_settings`, not through slots.

function normalizeEmirate(emirate: string): string {
  return emirate.trim().toLowerCase();
}

function slotEmirates(slot: { emirates?: readonly string[] }): string[] {
  return (slot.emirates ?? []).map(normalizeEmirate);
}

function slotServesEmirateExplicitly(
  slot: { emirates?: readonly string[] },
  emirate: string,
): boolean {
  return slotEmirates(slot).includes(normalizeEmirate(emirate));
}

/**
 * Two slots can ever be shown to the same customer only when both belong to
 * the default schedule, or both are dedicated to at least one shared emirate.
 * A default slot and a Fujairah-only slot never coexist for one emirate.
 */
export function slotScopesCompatible(
  a: { emirates?: readonly string[] },
  b: { emirates?: readonly string[] },
): boolean {
  const aList = slotEmirates(a);
  const bList = slotEmirates(b);
  if (aList.length === 0 || bList.length === 0) {
    return aList.length === 0 && bList.length === 0;
  }
  return aList.some((e) => bList.includes(e));
}

export type EmirateScheduleMode = "own" | "default";
export type EmirateScheduleStatus = "active" | "off";

export interface EmirateSchedule<TSlot> {
  /** `own` — emirate has active dedicated slots; `default` — falls back to all-emirates slots. */
  mode: EmirateScheduleMode;
  /** `off` — no active slots at all → no picker, order without a date. */
  status: EmirateScheduleStatus;
  /** Active slots the emirate's customers can pick from, sorted by start. */
  slots: TSlot[];
}

/**
 * Single source of truth for "which slots does this emirate see" — used by
 * the checkout picker, the submit-time revalidation, the manual admin order
 * and the admin overview. Inactive slots are dropped here, so callers may
 * pass either the full list or only active rows.
 */
export function resolveEmirateSchedule<TSlot extends DeliverySlotShape>(
  slots: readonly TSlot[],
  emirate: string,
): EmirateSchedule<TSlot> {
  const active = slots
    .filter((s) => s.is_active)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const own = active.filter((s) => slotServesEmirateExplicitly(s, emirate));
  if (own.length > 0) return { mode: "own", status: "active", slots: own };
  const fallback = active.filter((s) => slotEmirates(s).length === 0);
  return {
    mode: "default",
    status: fallback.length > 0 ? "active" : "off",
    slots: fallback,
  };
}

export interface EmirateScheduleSummary {
  emirate: string;
  mode: EmirateScheduleMode;
  status: EmirateScheduleStatus;
  activeCount: number;
}

export function summarizeEmirateSchedules<TSlot extends DeliverySlotShape>(
  emirates: readonly string[],
  slots: readonly TSlot[],
): EmirateScheduleSummary[] {
  return emirates.map((emirate) => {
    const schedule = resolveEmirateSchedule(slots, emirate);
    return {
      emirate,
      mode: schedule.mode,
      status: schedule.status,
      activeCount: schedule.slots.length,
    };
  });
}

// ─── Conflicts ──────────────────────────────────────────────────────────────

export interface SlotConflictShape {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: number[];
  emirates?: readonly string[];
}

export interface SlotConflictCandidate {
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: readonly number[];
  emirates: readonly string[];
}

export interface SlotConflict<T> {
  slot: T;
  /** ISO weekdays both slots run on. */
  weekdays: number[];
  /** Intersection of the two time ranges, "HH:mm". */
  overlapStart: string;
  overlapEnd: string;
  /** Emirates whose customers would see both slots; "all" for two default slots. */
  emirates: string[] | "all";
}

function toHm(time: string): string {
  return time.slice(0, 5);
}

/**
 * Every active slot that overlaps the candidate within one schedule:
 * compatible emirate scope + shared weekday + intersecting time range.
 * Touching ranges (12:00 end / 12:00 start) don't overlap. An inactive
 * candidate never conflicts — the check re-runs when it's activated.
 * "HH:mm[:ss]" strings compare lexicographically in numeric order.
 */
export function findSlotConflicts<T extends SlotConflictShape>(
  candidate: SlotConflictCandidate,
  existing: readonly T[],
  excludeId?: string,
): SlotConflict<T>[] {
  if (!candidate.is_active) return [];
  const start = toHm(candidate.start_time);
  const end = toHm(candidate.end_time);
  if (!start || !end || start >= end) return [];

  const conflicts: SlotConflict<T>[] = [];
  for (const slot of existing) {
    if (slot.id === excludeId) continue;
    if (!slot.is_active) continue;
    if (!slotScopesCompatible(candidate, slot)) continue;

    const weekdays = candidate.available_weekdays.filter((w) =>
      slot.available_weekdays.includes(w),
    );
    if (weekdays.length === 0) continue;

    const slotStart = toHm(slot.start_time);
    const slotEnd = toHm(slot.end_time);
    if (!(start < slotEnd && end > slotStart)) continue;

    const candidateEmirates = slotEmirates(candidate);
    const shared =
      candidateEmirates.length === 0
        ? "all"
        : (slot.emirates ?? []).filter((e) =>
            candidateEmirates.includes(normalizeEmirate(e)),
          );

    conflicts.push({
      slot,
      weekdays: [...weekdays].sort((a, b) => a - b),
      overlapStart: start > slotStart ? start : slotStart,
      overlapEnd: end < slotEnd ? end : slotEnd,
      emirates: shared,
    });
  }
  return conflicts.sort((a, b) =>
    a.slot.start_time.localeCompare(b.slot.start_time),
  );
}
