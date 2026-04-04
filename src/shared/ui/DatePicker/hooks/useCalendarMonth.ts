import { useState } from "react";

/**
 * Manages which month the calendar displays.
 *
 * Three sources compete for the visible month (in priority order):
 *   1. `manualMonth` — set by arrow buttons or the month/year picker.
 *   2. `value`       — the currently selected date (calendar scrolls to it).
 *   3. `new Date()`  — fallback when nothing is selected.
 *
 * Reset rules:
 *   - When the popover opens, `manualMonth` resets so the calendar
 *     always opens on the selected date (or today).
 *   - When `value` transitions from a date to `undefined` (external clear),
 *     `manualMonth` resets so the calendar falls back to today.
 *   - While `value` stays `undefined`, `manualMonth` is NOT reset —
 *     otherwise arrow/month-year navigation would be impossible.
 */
export function useCalendarMonth(value: Date | undefined, open: boolean) {
  /** Month set explicitly via arrows or month/year picker. */
  const [manualMonth, setManualMonth] = useState<Date | null>(null);

  /** Tracks popover open/close transitions. */
  const [wasOpen, setWasOpen] = useState(false);

  /** Tracks previous selected value to detect defined → undefined transitions. */
  const [prevValue, setPrevValue] = useState(value);

  // Reset manual navigation when the popover opens
  if (open && !wasOpen) {
    setWasOpen(true);
    if (manualMonth !== null) setManualMonth(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  // Reset manual month only on value transition (defined → undefined)
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value && manualMonth !== null) {
      setManualMonth(null);
    }
  }

  const displayMonth = manualMonth ?? value ?? new Date();

  return { displayMonth, setManualMonth } as const;
}
