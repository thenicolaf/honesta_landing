"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { getZoneIsoWeekday } from "@/shared/utils/zonedTime";
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
  date: Date | undefined;
  slotId: string;
  filteredSlots: DeliverySlot[];
  scheduleText: string;
  setDate: (next: Date | undefined) => void;
  setSlotId: (id: string) => void;
}

export function useDeliverySchedule(
  slots: DeliverySlot[],
): DeliveryScheduleState {
  const [date, setDateRaw] = useState<Date | undefined>(undefined);
  const [slotId, setSlotId] = useState<string>("");

  const filteredSlots = useMemo(
    () => (date ? activeSlotsForDate(slots, date) : []),
    [date, slots],
  );

  const scheduleText = useMemo(() => {
    if (!date || !slotId) return "";
    const slot = slots.find((s) => s.id === slotId);
    return slot ? formatSchedule(date, slot) : "";
  }, [date, slotId, slots]);

  function setDate(next: Date | undefined) {
    setDateRaw(next);
    if (!next) {
      setSlotId("");
      return;
    }
    const stillValid = activeSlotsForDate(slots, next).some(
      (s) => s.id === slotId,
    );
    if (!stillValid) setSlotId("");
  }

  return { date, slotId, filteredSlots, scheduleText, setDate, setSlotId };
}
