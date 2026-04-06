import { useState } from "react";
import { formatDateToDisplay, parseDateInput } from "../mask";

/**
 * Keeps the masked text input in sync with the DatePicker context value.
 *
 * Two data flows need coordination:
 *   - **Context → Input**: when the date changes externally (calendar pick,
 *     preset click), `localDisplay` must update to show the formatted date.
 *     Detected via `prevValue` comparison (render-time sync, no useEffect).
 *   - **Input → Context**: when the user types, `onInput` parses the masked
 *     string and pushes a valid Date into context, or clears the value when
 *     the input becomes empty.
 *
 * States:
 *   - `localDisplay` — the raw string shown in the input, owned by Maskito.
 *   - `prevValue`    — snapshot of the last context value we synced from,
 *     used to detect external changes without triggering on our own updates.
 */
export function useMaskedDateSync(
  value: Date | undefined,
  format: string,
  selectDate: (date: Date | undefined) => void,
  clear: () => void,
) {
  const [localDisplay, setLocalDisplay] = useState(() =>
    formatDateToDisplay(value, format),
  );
  const [prevValue, setPrevValue] = useState(value);

  // Sync from context → local when value changes externally (calendar pick)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalDisplay(formatDateToDisplay(value, format));
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = (e.target as HTMLInputElement).value;
    setLocalDisplay(raw);

    if (!raw) {
      if (value) {
        setPrevValue(undefined);
        clear();
      }
      return;
    }

    const parsed = parseDateInput(raw, format);
    if (parsed) {
      selectDate(parsed);
      setPrevValue(parsed);
    } else if (value && raw.length < format.length) {
      clear();
      setPrevValue(undefined);
    }
  };

  const handleClear = () => {
    setLocalDisplay("");
    setPrevValue(undefined);
    clear();
  };

  return { localDisplay, handleInput, handleClear } as const;
}
