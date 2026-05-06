"use client";

import {
  FormDatePicker,
  FormError,
  FormLabel,
  FormSelect,
} from "@/shared/ui";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { ManualOrderState } from "../actions";
import { ManualOrderSection } from "./ManualOrderSection";

interface DeliveryScheduleSectionProps {
  date: Date | undefined;
  slotId: string;
  filteredSlots: DeliverySlot[];
  scheduleText: string;
  fieldErrors?: ManualOrderState["fieldErrors"];
  onDateChange: (next: Date | undefined) => void;
  onSlotChange: (id: string) => void;
}

export function DeliveryScheduleSection({
  date,
  slotId,
  filteredSlots,
  scheduleText,
  fieldErrors,
  onDateChange,
  onSlotChange,
}: DeliveryScheduleSectionProps) {
  return (
    <ManualOrderSection title="Delivery schedule">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FormLabel required>Date</FormLabel>
          <FormDatePicker
            name="delivery_date_unused"
            value={date}
            onValueChange={onDateChange}
            clearable
            state={fieldErrors?.deliveryDate ? "error" : "default"}
          />
          <FormError message={fieldErrors?.deliveryDate} />
        </div>
        <div>
          <FormLabel required>Slot</FormLabel>
          <FormSelect
            name="delivery_slot_id_unused"
            value={slotId}
            onValueChange={onSlotChange}
            disabled={!date}
            placeholder={!date ? "Select date first" : "Select slot"}
            options={filteredSlots.map((s) => ({
              value: s.id,
              label: `${s.label} · ${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`,
            }))}
            state={fieldErrors?.deliverySlot ? "error" : "default"}
          />
          <FormError message={fieldErrors?.deliverySlot} />
        </div>
      </div>

      <input type="hidden" name="delivery_schedule" value={scheduleText} />
    </ManualOrderSection>
  );
}
