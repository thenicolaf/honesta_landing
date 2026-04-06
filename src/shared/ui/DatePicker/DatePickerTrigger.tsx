"use client";

import { PopoverTrigger } from "../Popover";

interface DatePickerTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function DatePickerTrigger({
  children,
  className,
}: DatePickerTriggerProps) {
  return (
    <PopoverTrigger asChild className={className}>
      {children}
    </PopoverTrigger>
  );
}
