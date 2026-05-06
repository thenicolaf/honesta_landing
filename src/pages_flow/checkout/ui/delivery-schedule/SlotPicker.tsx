"use client";

import {
  FormError,
  FormTileRadio,
  FormTileRadioItem,
} from "@/shared/ui";
import {
  formatLongDate,
  fromDateOnlyString,
} from "@/shared/utils/zonedTime";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";

interface SlotPickerProps {
  dateIso: string;
  slots: DeliverySlot[];
  selectedSlotId: string;
  errorMessage?: string;
  onPick: (id: string) => void;
}

export function SlotPicker({
  dateIso,
  slots,
  selectedSlotId,
  errorMessage,
  onPick,
}: SlotPickerProps) {
  if (!dateIso || slots.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="font-body font-semibold uppercase tracking-widest text-2xs text-earth/45 mb-2">
        Slot for {formatLongDate(fromDateOnlyString(dateIso))}
      </p>
      <FormTileRadio
        name="delivery_slot_tile"
        value={selectedSlotId}
        onValueChange={onPick}
      >
        {slots.map((slot) => (
          <FormTileRadioItem key={slot.id} value={slot.id}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-body font-semibold uppercase tracking-widest text-2xs">
                {slot.label}
              </span>
              <span className="font-body text-sm tabular-nums opacity-80">
                {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
              </span>
            </div>
          </FormTileRadioItem>
        ))}
      </FormTileRadio>
      <FormError message={errorMessage} />
    </div>
  );
}
