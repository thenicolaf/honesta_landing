"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addDays, format } from "date-fns";
import {
  Button,
  FormDatePicker,
  FormError,
  FormInput,
  FormLabel,
  FormSelect,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import {
  fromDateOnlyString,
  getZoneIsoWeekday,
} from "@/shared/utils/zonedTime";
import {
  addBlackoutAction,
  updateBlackoutAction,
  type BlackoutState,
} from "./actions";

interface BlackoutFormProps {
  blackout: DeliveryBlackout | null;
  slots: DeliverySlot[];
  onClose: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
    >
      {pending ? "Saving…" : isEdit ? "Save" : "Block"}
    </Button>
  );
}

export function BlackoutForm({ blackout, slots, onClose }: BlackoutFormProps) {
  const isEdit = blackout !== null;
  const action = isEdit
    ? updateBlackoutAction.bind(null, blackout.id)
    : addBlackoutAction;
  const [state, dispatch] = useActionState<BlackoutState | null, FormData>(
    action,
    null,
  );

  const [date, setDate] = useState<Date | undefined>(() =>
    blackout ? fromDateOnlyString(blackout.blackout_date) : undefined,
  );
  const [slotId, setSlotIdRaw] = useState<string>(() => blackout?.slot_id ?? "");

  const filteredSlots = useMemo(() => {
    if (!date) return [];
    const isoWeekday = getZoneIsoWeekday(date);
    return slots
      .filter((s) => s.is_active)
      .filter((s) => s.available_weekdays.includes(isoWeekday))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [date, slots]);

  // Effective value derived during render — if the picked slot doesn't fit the
  // currently selected date's weekday, fall back to "" (all day).
  const effectiveSlotId = filteredSlots.some((s) => s.id === slotId)
    ? slotId
    : "";

  function handleDateChange(next: Date | undefined) {
    setDate(next);
    if (!next) {
      setSlotIdRaw("");
      return;
    }
    const isoWeekday = getZoneIsoWeekday(next);
    const stillValid = slots
      .filter((s) => s.is_active && s.available_weekdays.includes(isoWeekday))
      .some((s) => s.id === slotId);
    if (!stillValid) setSlotIdRaw("");
  }

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess(isEdit ? "Blackout updated" : "Date blocked");
      onClose();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors)
      toastError(
        Object.values(state.fieldErrors)[0] ?? "Check the fields",
      );
  }, [state, isEdit, onClose]);

  const today = new Date();
  const maxDate = addDays(today, 60);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div>
        <FormLabel required>Date</FormLabel>
        <FormDatePicker
          name="blackout_date_unused"
          value={date}
          onValueChange={handleDateChange}
          minDate={today}
          maxDate={maxDate}
          clearable
          state={state?.fieldErrors?.blackout_date ? "error" : "default"}
        />
        <input
          type="hidden"
          name="blackout_date"
          value={date ? format(date, "yyyy-MM-dd") : ""}
        />
        <FormError message={state?.fieldErrors?.blackout_date} />
      </div>

      <div>
        <FormLabel>Slot</FormLabel>
        <FormSelect
          name="slot_id"
          value={effectiveSlotId}
          onValueChange={setSlotIdRaw}
          disabled={!date}
          placeholder={!date ? "Pick a date first" : "All day"}
          options={[
            { value: "", label: "All day" },
            ...filteredSlots.map((s) => ({
              value: s.id,
              label: `${s.label} · ${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`,
            })),
          ]}
          state={state?.fieldErrors?.slot_id ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.slot_id} />
      </div>

      <div>
        <FormLabel htmlFor="blackout_reason">Reason (optional)</FormLabel>
        <FormInput
          id="blackout_reason"
          name="reason"
          placeholder="Overload / Eid / …"
          defaultValue={state?.values?.reason ?? blackout?.reason ?? ""}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button as="button" type="button" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
