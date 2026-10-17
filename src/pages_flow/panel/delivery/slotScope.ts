import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import {
  summarizeEmirateSchedules,
  type SlotConflict,
} from "@/shared/utils/deliverySlots";
import { weekdayShortLabel, type WeekdayIso } from "@/shared/consts/delivery";

/** Serializable conflict row — returned from server actions and rendered by the form. */
export interface SlotConflictInfo {
  slotId: string;
  label: string;
  range: string;
  weekdays: number[];
  overlap: string;
  emirates: string[] | "all";
}

export function formatSlotRange(slot: {
  start_time: string;
  end_time: string;
}): string {
  return `${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}`;
}

export function formatEmiratesScope(emirates: readonly string[] | "all"): string {
  if (emirates === "all" || emirates.length === 0) return "All emirates";
  return emirates.join(", ");
}

export function toConflictInfo(
  conflict: SlotConflict<DeliverySlot>,
): SlotConflictInfo {
  return {
    slotId: conflict.slot.id,
    label: conflict.slot.label,
    range: formatSlotRange(conflict.slot),
    weekdays: conflict.weekdays,
    overlap: `${conflict.overlapStart}–${conflict.overlapEnd}`,
    emirates: conflict.emirates,
  };
}

/** `«Morning» 09:00–12:00 · Mon, Tue · Dubai, Sharjah — overlap 11:00–12:00` */
export function formatConflictLine(info: SlotConflictInfo): string {
  const days = info.weekdays
    .map((d) => weekdayShortLabel(d as WeekdayIso))
    .join(", ");
  return `«${info.label}» ${info.range} · ${days} · ${formatEmiratesScope(info.emirates)} — overlap ${info.overlap}`;
}

// ─── Override impact ────────────────────────────────────────────────────────

export interface ScheduleImpactInput {
  is_active: boolean;
  emirates: readonly string[];
}

/** One grouped consequence: `emirates` render bold, followed by `text`. */
export interface ScheduleImpactLine {
  kind: "own" | "fallback" | "empty" | "applies";
  emirates: string[];
  text: string;
}

/**
 * Consequences of saving the edited slot, derived by diffing
 * `summarizeEmirateSchedules` before vs after. Emirates with the same outcome
 * are grouped into one line — the all-emirates schedule is global, so its
 * slot count is identical for every emirate that uses it.
 */
export function describeScheduleImpact(
  emirateNames: readonly string[],
  allSlots: readonly DeliverySlot[],
  candidate: ScheduleImpactInput,
  editedSlotId: string | undefined,
): ScheduleImpactLine[] {
  const NEW_ID = "__candidate__";
  const id = editedSlotId ?? NEW_ID;
  const base = allSlots.find((s) => s.id === id);
  const nextSlot: DeliverySlot = {
    id,
    label: base?.label ?? "",
    start_time: base?.start_time ?? "00:00:00",
    end_time: base?.end_time ?? "00:00:00",
    available_weekdays: base?.available_weekdays ?? [],
    created_at: base?.created_at ?? "",
    updated_at: base?.updated_at ?? "",
    is_active: candidate.is_active,
    emirates: [...candidate.emirates],
  };
  const nextSlots = editedSlotId
    ? allSlots.map((s) => (s.id === editedSlotId ? nextSlot : s))
    : [...allSlots, nextSlot];

  const before = summarizeEmirateSchedules(emirateNames, allSlots);
  const after = summarizeEmirateSchedules(emirateNames, nextSlots);

  const gainedOwn: string[] = [];
  const backToDefault: string[] = [];
  const noSchedule: string[] = [];
  let replacedCount = 0;
  let fallbackCount = 0;
  after.forEach((a, i) => {
    const b = before[i];
    if (b.mode === "default" && a.mode === "own") {
      gainedOwn.push(a.emirate);
      replacedCount = b.activeCount;
    } else if (b.mode === "own" && a.mode === "default") {
      if (a.status === "off") noSchedule.push(a.emirate);
      else {
        backToDefault.push(a.emirate);
        fallbackCount = a.activeCount;
      }
    }
  });

  const lines: ScheduleImpactLine[] = [];
  if (gainedOwn.length > 0) {
    lines.push({
      kind: "own",
      emirates: gainedOwn,
      text:
        replacedCount > 0
          ? `— own slots only, ${replacedCount} all-emirates slot${replacedCount === 1 ? "" : "s"} stop${replacedCount === 1 ? "s" : ""} applying.`
          : "— own slots only.",
    });
  }
  if (backToDefault.length > 0) {
    lines.push({
      kind: "fallback",
      emirates: backToDefault,
      text: `— back to all-emirates slots (${fallbackCount}).`,
    });
  }
  if (noSchedule.length > 0) {
    lines.push({
      kind: "empty",
      emirates: noSchedule,
      text: "— no slots left, orders go without a date.",
    });
  }
  if (candidate.is_active && candidate.emirates.length === 0) {
    const applies = after
      .filter((a) => a.mode === "default")
      .map((a) => a.emirate);
    lines.push(
      applies.length > 0
        ? { kind: "applies", emirates: applies, text: "— this slot applies here." }
        : {
            kind: "applies",
            emirates: [],
            text: "Every emirate has own slots — nobody will see this one.",
          },
    );
  }
  return lines;
}
