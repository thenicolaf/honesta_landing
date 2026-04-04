"use client";

import { createContext, useContext } from "react";

export interface DatePickerContextValue {
  value: Date | undefined;
  showTime: boolean;
  clearable: boolean;
  /** Display format for maskito: "dd.MM.yyyy" or "dd.MM.yyyy HH:mm" */
  format: string;
  /** Minimum selectable date (inclusive) */
  minDate?: Date;
  /** Maximum selectable date (inclusive) */
  maxDate?: Date;
  selectDate: (date: Date | undefined) => void;
  clear: () => void;
  /** Formatted value for display: "4 Apr 2026" or "4 Apr 2026, 14:30" */
  displayValue: string;
  /** Formatted value for hidden input: "2026-04-04" or ISO 8601 */
  formValue: string;
}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);

export function useDatePicker() {
  const ctx = useContext(DatePickerContext);
  if (!ctx) throw new Error("useDatePicker must be used within <DatePicker>");
  return ctx;
}
