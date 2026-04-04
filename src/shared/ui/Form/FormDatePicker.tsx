"use client";

import { useState } from "react";
import { IconCalendar } from "@/shared/icons";
import { Button } from "../Button";
import {
  DatePicker,
  DatePickerTrigger,
  DatePickerMaskedInput,
  DatePickerContent,
  DatePickerPresets,
  useDatePicker,
} from "../DatePicker";
import { FormLabel } from "./FormLabel";
import { FormError } from "./FormError";

interface FormDatePickerProps {
  id?: string;
  name: string;
  label?: string;
  required?: boolean;
  value?: Date;
  defaultValue?: Date;
  placeholder?: string;
  showTime?: boolean;
  clearable?: boolean;
  state?: "default" | "error";
  errorMessage?: string;
  className?: string;
  onValueChange?: (value: Date | undefined) => void;
  presets?: Array<{ label: string; date: Date }>;
  minDate?: Date;
  maxDate?: Date;
}

function HiddenInput({ id, name }: { id?: string; name: string }) {
  const { formValue } = useDatePicker();
  return <input type="hidden" id={id} name={name} value={formValue} />;
}

export function FormDatePicker({
  id,
  name,
  label,
  required,
  value: controlledValue,
  defaultValue,
  placeholder,
  showTime = false,
  clearable = false,
  state,
  errorMessage,
  className,
  onValueChange,
  presets,
  minDate,
  maxDate,
}: FormDatePickerProps) {
  const [internalValue, setInternalValue] = useState<Date | undefined>(
    defaultValue,
  );
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (date: Date | undefined) => {
    if (!isControlled) setInternalValue(date);
    onValueChange?.(date);
  };

  return (
    <div className={className}>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      <DatePicker
        value={value}
        onValueChange={handleChange}
        showTime={showTime}
        clearable={clearable}
        minDate={minDate}
        maxDate={maxDate}
        className="w-full"
      >
        <DatePickerMaskedInput
          state={state}
          placeholder={placeholder}
          startIcon={
            <DatePickerTrigger>
              <Button
                as="button"
                type="button"
                variant="text"
                size="icon"
                className="w-auto! h-auto! min-h-0! p-0! pointer-events-auto cursor-pointer"
              >
                <IconCalendar className="w-4 h-4" />
              </Button>
            </DatePickerTrigger>
          }
        />
        <HiddenInput id={id} name={name} />
        <DatePickerContent>
          {presets && <DatePickerPresets presets={presets} />}
        </DatePickerContent>
      </DatePicker>
      <FormError message={errorMessage} />
    </div>
  );
}
