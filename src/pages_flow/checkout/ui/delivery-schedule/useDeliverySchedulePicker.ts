"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fromDateOnlyString } from "@/shared/utils/zonedTime";
import { getAvailableSlotsForDate } from "@/shared/utils/deliverySlots";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import { buildDayGrid, type DayGrid } from "./buildDayCells";

export interface DeliverySchedulePickerArgs {
  slots: DeliverySlot[];
  blackouts: DeliveryBlackout[];
  cutoffHour: number;
  deliveryDays: number;
  onSelectionChange?: (selected: boolean) => void;
}

export interface DeliverySchedulePicker {
  grid: DayGrid;
  selectedDateIso: string;
  selectedSlotId: string;
  slotsForSelectedDate: DeliverySlot[];
  noSlotsAvailable: boolean;
  pickDate: (iso: string) => void;
  pickSlot: (id: string) => void;
}

/**
 * Owns the picker state and derives effective values during render — no
 * setState-in-effect cascades when upstream slots/blackouts/cutoff shift.
 */
export function useDeliverySchedulePicker({
  slots,
  blackouts,
  cutoffHour,
  deliveryDays,
  onSelectionChange,
}: DeliverySchedulePickerArgs): DeliverySchedulePicker {
  const grid = useMemo(
    () => buildDayGrid(slots, blackouts, cutoffHour, deliveryDays),
    [slots, blackouts, cutoffHour, deliveryDays],
  );

  // Raw user picks. Effective values fall back to defaults if the pick stops
  // being valid (e.g., admin blocked the date between selection and rerender).
  const [pickedDateIso, setPickedDateIso] = useState<string>("");
  const [pickedSlotId, setPickedSlotId] = useState<string>("");

  const selectedDateIso = useMemo(() => {
    const stillValid = grid.cells.find(
      (d) => d.iso === pickedDateIso && d.available,
    );
    if (stillValid) return pickedDateIso;
    return grid.earliestAvailable?.iso ?? "";
  }, [pickedDateIso, grid.cells, grid.earliestAvailable]);

  const slotsForSelectedDate = useMemo<DeliverySlot[]>(() => {
    if (!selectedDateIso) return [];
    return getAvailableSlotsForDate(
      fromDateOnlyString(selectedDateIso),
      slots,
      blackouts,
      cutoffHour,
      deliveryDays,
    );
  }, [selectedDateIso, slots, blackouts, cutoffHour, deliveryDays]);

  const selectedSlotId = useMemo(() => {
    if (slotsForSelectedDate.length === 0) return "";
    if (slotsForSelectedDate.some((s) => s.id === pickedSlotId))
      return pickedSlotId;
    return slotsForSelectedDate.length === 1 ? slotsForSelectedDate[0].id : "";
  }, [pickedSlotId, slotsForSelectedDate]);

  const noSlotsAvailable = grid.cells.every((d) => !d.available);

  // Notify parent when the effective slot selection toggles. Wrapped in
  // useEffect so we don't call setState-in-render on the parent.
  const lastReported = useRef<boolean | null>(null);
  useEffect(() => {
    const isSelected = !!selectedSlotId;
    if (lastReported.current === isSelected) return;
    lastReported.current = isSelected;
    onSelectionChange?.(isSelected);
  }, [selectedSlotId, onSelectionChange]);

  function pickDate(iso: string) {
    setPickedDateIso(iso);
    setPickedSlotId("");
  }

  return {
    grid,
    selectedDateIso,
    selectedSlotId,
    slotsForSelectedDate,
    noSlotsAvailable,
    pickDate,
    pickSlot: setPickedSlotId,
  };
}
