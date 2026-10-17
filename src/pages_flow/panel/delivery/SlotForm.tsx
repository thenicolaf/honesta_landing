"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import {
  Alert,
  Button,
  FormCheckbox,
  FormError,
  FormInput,
  FormLabel,
  FormTimePicker,
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectItem,
  MultiSelectTrigger,
  TagToolbarMulti,
  TagToolbarMultiItem,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import {
  WEEKDAYS_ISO,
  weekdayShortLabel,
} from "@/shared/consts/delivery";
import { findSlotConflicts } from "@/shared/utils/deliverySlots";
import { cn } from "@/shared/utils/cn";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import {
  createSlotAction,
  type SlotState,
  updateSlotAction,
} from "./actions";
import { computeFreeWindows, formatFreeWindowsLabel } from "./freeWindows";
import {
  describeScheduleImpact,
  formatConflictLine,
  toConflictInfo,
} from "./slotScope";

export interface EmirateOption {
  emirate: string;
  is_active: boolean;
}

interface SlotFormProps {
  slot: DeliverySlot | null;
  allSlots: DeliverySlot[];
  emirateOptions: EmirateOption[];
  onClose: () => void;
}

function SubmitButton({
  slot,
  blocked,
}: {
  slot: DeliverySlot | null;
  blocked: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending || blocked}
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

function formatTime(date: Date | undefined): string {
  return date ? format(date, "HH:mm") : "";
}

export function SlotForm({
  slot,
  allSlots,
  emirateOptions,
  onClose,
}: SlotFormProps) {
  const router = useRouter();
  const action = slot
    ? updateSlotAction.bind(null, slot.id)
    : createSlotAction;
  const [state, dispatch] = useActionState<SlotState | null, FormData>(
    action,
    null,
  );

  // All schedule-shaping fields are controlled so overlaps and override
  // consequences can be computed live, before the admin hits Save.
  const [weekdays, setWeekdays] = useState<readonly number[]>(
    slot?.available_weekdays ?? WEEKDAYS_ISO,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    parseTime(slot?.start_time),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    parseTime(slot?.end_time),
  );
  const [isActive, setIsActive] = useState(slot?.is_active ?? true);
  const [emirates, setEmirates] = useState<string[]>(slot?.emirates ?? []);

  const candidate = {
    start_time: formatTime(startDate),
    end_time: formatTime(endDate),
    is_active: isActive,
    available_weekdays: weekdays,
    emirates,
  };

  const conflicts = findSlotConflicts(candidate, allSlots, slot?.id).map(
    toConflictInfo,
  );
  const impact = describeScheduleImpact(
    emirateOptions.map((o) => o.emirate),
    allSlots,
    { is_active: isActive, emirates },
    slot?.id,
  );

  const freeWindows = useMemo(
    () => computeFreeWindows(weekdays, emirates, allSlots, slot?.id),
    [weekdays, emirates, allSlots, slot?.id],
  );
  const { text: freeText, hasFullyBlocked } =
    formatFreeWindowsLabel(freeWindows);

  const multiSelectOptions = emirateOptions.map((o) => ({
    value: o.emirate,
    label: o.is_active ? o.emirate : `${o.emirate} (inactive)`,
  }));

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess(slot ? "Slot updated" : "Slot created");
      onClose();
      return;
    }
    // Server caught an overlap the live check missed (another tab saved a
    // slot meanwhile) — refresh `allSlots` so the live alert shows it.
    if (state?.conflicts?.length) router.refresh();
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors)
      toastError(
        Object.values(state.fieldErrors)[0] ?? "Check the fields",
      );
  }, [state, slot, onClose, router]);

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

      <div>
        <FormLabel>Emirates</FormLabel>
        <MultiSelect
          value={emirates}
          onValueChange={setEmirates}
          options={multiSelectOptions}
          clearable
        >
          <MultiSelectTrigger
            placeholder="All emirates"
            className={cn(
              "rounded-xl px-4 min-h-10 py-2 text-sm bg-cream",
              state?.fieldErrors?.emirates
                ? "border-red-400 focus-visible:ring-red-300/40"
                : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
            )}
          />
          <MultiSelectContent searchPlaceholder="Search emirates…">
            {(opts) => (
              <>
                {opts.map((o) => (
                  <MultiSelectItem
                    key={o.value}
                    value={o.value}
                    searchValue={o.label}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                  </MultiSelectItem>
                ))}
                <MultiSelectEmpty />
              </>
            )}
          </MultiSelectContent>
        </MultiSelect>
        <input type="hidden" name="emirates" value={JSON.stringify(emirates)} />
        <p className="mt-1 text-2xs font-body text-earth/55">
          Leave empty to apply to all emirates. An emirate with its own slots
          uses only those.
        </p>
        <FormError message={state?.fieldErrors?.emirates} />
      </div>

      <FormCheckbox
        name="is_active"
        checked={isActive}
        onChange={(e) => setIsActive(e.target.checked)}
        label="Active"
      />

      {conflicts.length > 0 && (
        <Alert
          variant="error"
          title={`Overlaps with ${conflicts.length} slot${conflicts.length === 1 ? "" : "s"}`}
        >
          <ul className="flex flex-col gap-0.5">
            {conflicts.map((c) => (
              <li key={c.slotId}>{formatConflictLine(c)}</li>
            ))}
          </ul>
          <p className="mt-1">
            Customers would see overlapping windows. Change the time, weekdays
            or emirates — or disable this slot.
          </p>
        </Alert>
      )}

      {conflicts.length === 0 && impact.length > 0 && (
        <Alert variant="info">
          <ul className="flex flex-col gap-0.5">
            {impact.map((line) => (
              <li key={line.kind}>
                {line.emirates.length > 0 && (
                  <strong className="font-semibold text-earth">
                    {line.emirates.join(", ")}{" "}
                  </strong>
                )}
                {line.text}
              </li>
            ))}
          </ul>
          {impact.some((l) => l.kind === "fallback" || l.kind === "empty") && (
            <p className="mt-1 text-earth/55">
              To stop deliveries to an emirate, deactivate it instead.
            </p>
          )}
        </Alert>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button as="button" type="button" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton slot={slot} blocked={conflicts.length > 0} />
      </div>
    </form>
  );
}
