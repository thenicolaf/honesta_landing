"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { getZoneIsoWeekday } from "@/shared/utils/zonedTime";
import {
  resolveEmirateSchedule,
  type EmirateScheduleStatus,
} from "@/shared/utils/deliverySlots";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";

function activeSlotsForDate(
  slots: DeliverySlot[],
  date: Date,
): DeliverySlot[] {
  const isoWeekday = getZoneIsoWeekday(date);
  return slots
    .filter((s) => s.is_active)
    .filter((s) => s.available_weekdays.includes(isoWeekday))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

function formatSchedule(date: Date, slot: DeliverySlot): string {
  const formatted = format(date, "d MMM yyyy");
  return `${formatted} · ${slot.label} ${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}`;
}

export interface DeliveryScheduleState {
  /** `off` — no active slots for the emirate, the section is hidden. */
  status: EmirateScheduleStatus;
  date: Date | undefined;
  slotId: string;
  filteredSlots: DeliverySlot[];
  scheduleText: string;
  setDate: (next: Date | undefined) => void;
  setSlotId: (id: string) => void;
}

/**
 * Same per-emirate resolution as public checkout (own slots override the
 * all-emirates ones) but without cut-off / blackouts — admins back-fill
 * historical orders.
 */
export function useDeliverySchedule(
  slots: DeliverySlot[],
  emirate: string,
): DeliveryScheduleState {
  const [date, setDateRaw] = useState<Date | undefined>(undefined);
  const [pickedSlotId, setSlotId] = useState<string>("");

  const schedule = useMemo(
    () => resolveEmirateSchedule(slots, emirate),
    [slots, emirate],
  );

  const filteredSlots = useMemo(
    () => (date ? activeSlotsForDate(schedule.slots, date) : []),
    [date, schedule],
  );

  // Derived during render: a pick that no longer fits the date or the
  // emirate (address changed) silently drops out.
  const slotId = filteredSlots.some((s) => s.id === pickedSlotId)
    ? pickedSlotId
    : "";

  const scheduleText = useMemo(() => {
    if (!date || !slotId) return "";
    const slot = filteredSlots.find((s) => s.id === slotId);
    return slot ? formatSchedule(date, slot) : "";
  }, [date, slotId, filteredSlots]);

  function setDate(next: Date | undefined) {
    setDateRaw(next);
    if (!next) setSlotId("");
  }

  return {
    status: schedule.status,
    date,
    slotId,
    filteredSlots,
    scheduleText,
    setDate,
    setSlotId,
  };
}
