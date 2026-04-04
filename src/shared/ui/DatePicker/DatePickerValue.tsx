"use client";

import { cn } from "@/shared/utils/cn";
import { useDatePicker } from "./context";

interface DatePickerValueProps {
  placeholder?: string;
  className?: string;
}

export function DatePickerValue({
  placeholder = "Select date",
  className,
}: DatePickerValueProps) {
  const { displayValue } = useDatePicker();

  return (
    <span
      className={cn(
        "truncate",
        displayValue ? "text-earth" : "text-earth/40",
        className,
      )}
    >
      {displayValue || placeholder}
    </span>
  );
}
