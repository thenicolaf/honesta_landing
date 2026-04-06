"use client";

import { useState } from "react";
import { Popover } from "../Popover";
import { DatePickerContext } from "./context";
import { formatDisplay, formatFormValue } from "./format";

interface DatePickerProps {
  children: React.ReactNode;
  className?: string;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  showTime?: boolean;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  children,
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  showTime = false,
  clearable = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState<Date | undefined>(
    defaultValue,
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const format = showTime ? "dd.MM.yyyy HH:mm" : "dd.MM.yyyy";

  const selectDate = (date: Date | undefined) => {
    setInternalValue(date);
    onValueChange?.(date);
  };

  const clear = () => {
    setInternalValue(undefined);
    onValueChange?.(undefined);
  };

  const displayValue = value ? formatDisplay(value, showTime) : "";
  const formValue = value ? formatFormValue(value, showTime) : "";

  return (
    <DatePickerContext.Provider
      value={{
        value,
        showTime,
        clearable,
        format,
        minDate,
        maxDate,
        selectDate,
        clear,
        displayValue,
        formValue,
      }}
    >
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        className={className}
      >
        {children}
      </Popover>
    </DatePickerContext.Provider>
  );
}
