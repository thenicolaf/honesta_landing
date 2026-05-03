"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { parse } from "date-fns";
import {
  Button,
  FormCheckbox,
  FormError,
  FormInput,
  FormLabel,
  FormTimePicker,
  TagToolbarMulti,
  TagToolbarMultiItem,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import {
  WEEKDAYS_ISO,
  weekdayShortLabel,
} from "@/shared/consts/delivery";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import {
  createSlotAction,
  type SlotState,
  updateSlotAction,
} from "./actions";
import { computeFreeWindows, formatFreeWindowsLabel } from "./freeWindows";

interface SlotFormProps {
  slot: DeliverySlot | null;
  allSlots: DeliverySlot[];
  onClose: () => void;
}

function SubmitButton({ slot }: { slot: DeliverySlot | null }) {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
    >
      {pending ? "Saving…" : slot ? "Save" : "Create"}
    </Button>
  );
}

function parseTime(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  try {
    const date = parse(value.slice(0, 5), "HH:mm", new Date());
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

export function SlotForm({ slot, allSlots, onClose }: SlotFormProps) {
  const action = slot
    ? updateSlotAction.bind(null, slot.id)
    : createSlotAction;
  const [state, dispatch] = useActionState<SlotState | null, FormData>(
    action,
    null,
  );

  const initialWeekdays = (state?.values?.available_weekdays ??
    slot?.available_weekdays ??
    WEEKDAYS_ISO) as readonly number[];

  const [weekdays, setWeekdays] = useState<readonly number[]>(initialWeekdays);
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    parseTime(state?.values?.start_time ?? slot?.start_time),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    parseTime(state?.values?.end_time ?? slot?.end_time),
  );

  const freeWindows = useMemo(
    () => computeFreeWindows(weekdays, allSlots, slot?.id),
    [weekdays, allSlots, slot?.id],
  );
  const { text: freeText, hasFullyBlocked } =
    formatFreeWindowsLabel(freeWindows);

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess(slot ? "Slot updated" : "Slot created");
      onClose();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors)
      toastError(
        Object.values(state.fieldErrors)[0] ?? "Check the fields",
      );
  }, [state, slot, onClose]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="slot_label" required>
          Label
        </FormLabel>
        <FormInput
          id="slot_label"
          name="label"
          defaultValue={state?.values?.label ?? slot?.label ?? ""}
          state={state?.fieldErrors?.label ? "error" : "default"}
          placeholder="Morning"
        />
        <FormError message={state?.fieldErrors?.label} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FormLabel required>Start</FormLabel>
          <FormTimePicker
            name="start_time"
            value={startDate}
            onValueChange={setStartDate}
            placeholder="09:00"
            state={state?.fieldErrors?.start_time ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.start_time} />
        </div>
        <div>
          <FormLabel required>End</FormLabel>
          <FormTimePicker
            name="end_time"
            value={endDate}
            onValueChange={setEndDate}
            placeholder="15:00"
            state={state?.fieldErrors?.end_time ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.end_time} />
        </div>
      </div>

      <p
        className={
          hasFullyBlocked
            ? "text-2xs font-body text-red-600"
            : "text-2xs font-body text-earth/55"
        }
      >
        Free: {freeText}
      </p>

      <div>
        <FormLabel required>Weekdays</FormLabel>
        <TagToolbarMulti
          value={weekdays.map(String)}
          onValueChange={(next) => setWeekdays(next.map(Number))}
        >
          {WEEKDAYS_ISO.map((d) => (
            <TagToolbarMultiItem key={d} value={String(d)}>
              {weekdayShortLabel(d)}
            </TagToolbarMultiItem>
          ))}
        </TagToolbarMulti>
        <input
          type="hidden"
          name="available_weekdays"
          value={weekdays.join(",")}
        />
        <FormError message={state?.fieldErrors?.available_weekdays} />
      </div>

      <FormCheckbox
        name="is_active"
        defaultChecked={state?.values?.is_active ?? slot?.is_active ?? true}
        label="Active"
      />

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button as="button" type="button" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton slot={slot} />
      </div>
    </form>
  );
}
