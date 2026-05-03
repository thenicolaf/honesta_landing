"use client";

import { FormError, FormLabel } from "@/shared/ui";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import { DateGrid } from "./delivery-schedule/DateGrid";
import { EarliestDeliveryHint } from "./delivery-schedule/EarliestDeliveryHint";
import { SlotPicker } from "./delivery-schedule/SlotPicker";
import { useDeliverySchedulePicker } from "./delivery-schedule/useDeliverySchedulePicker";

interface DeliveryScheduleSectionProps {
  slots: DeliverySlot[];
  blackouts: DeliveryBlackout[];
  cutoffHour: number;
  deliveryDays: number;
  fieldErrors?: { deliveryDate?: string; deliverySlot?: string };
  /** Fires whenever the effective slot selection changes. */
  onSelectionChange?: (selected: boolean) => void;
}

export function DeliveryScheduleSection({
  slots,
  blackouts,
  cutoffHour,
  deliveryDays,
  fieldErrors,
  onSelectionChange,
}: DeliveryScheduleSectionProps) {
  const picker = useDeliverySchedulePicker({
    slots,
    blackouts,
    cutoffHour,
    deliveryDays,
    onSelectionChange,
  });

  // No slots configured at all → admin hasn't set anything up. Render nothing
  // so the rest of checkout (notes/promo/submit) keeps working without delivery
  // scheduling. Guests can still place an order.
  if (slots.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <FormLabel required>When should we deliver?</FormLabel>

      {picker.noSlotsAvailable ? (
        <p className="text-sm font-body text-earth/65">
          Delivery is temporarily unavailable. Contact us on Instagram for
          details.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <DateGrid
            cells={picker.grid.cells}
            weekdayLabels={picker.grid.weekdayLabels}
            selectedDateIso={picker.selectedDateIso}
            onPick={picker.pickDate}
          />
          <FormError message={fieldErrors?.deliveryDate} />

          <EarliestDeliveryHint cell={picker.grid.earliestAvailable} />

          <SlotPicker
            dateIso={picker.selectedDateIso}
            slots={picker.slotsForSelectedDate}
            selectedSlotId={picker.selectedSlotId}
            errorMessage={fieldErrors?.deliverySlot}
            onPick={picker.pickSlot}
          />
        </div>
      )}

      <input
        type="hidden"
        name="delivery_date"
        value={picker.selectedDateIso}
      />
      <input
        type="hidden"
        name="delivery_slot_id"
        value={picker.selectedSlotId}
      />
    </section>
  );
}
