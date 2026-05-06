"use client";

import { useState } from "react";
import { IconCalendar } from "@/shared/icons";
import { Button } from "../Button";
import {
  DatePicker,
  DatePickerTrigger,
  DatePickerMaskedInput,
  DatePickerTimeContent,
  useDatePicker,
} from "../DatePicker";
import { FormLabel } from "./FormLabel";
import { FormError } from "./FormError";

interface FormTimePickerProps {
  id?: string;
  name: string;
  label?: string;
  required?: boolean;
  value?: Date;
  defaultValue?: Date;
  placeholder?: string;
  clearable?: boolean;
  state?: "default" | "error";
  errorMessage?: string;
  className?: string;
  onValueChange?: (value: Date | undefined) => void;
}

function HiddenInput({ id, name }: { id?: string; name: string }) {
  const { formValue } = useDatePicker();
  return <input type="hidden" id={id} name={name} value={formValue} />;
}

export function FormTimePicker({
  id,
  name,
  label,
  required,
  value: controlledValue,
  defaultValue,
  placeholder,
  clearable = false,
  state,
  errorMessage,
  className,
  onValueChange,
}: FormTimePickerProps) {
  const [internalValue, setInternalValue] = useState<Date | undefined>(
    defaultValue,
  );
  const isControlled = onValueChange !== undefined;
  // Adjust state in-render when defaultValue changes (e.g. server action
  // echoes submitted values back through props).
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue);
    if (!isControlled) setInternalValue(defaultValue);
  }
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (date: Date | undefined) => {
    setInternalValue(date);
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
        timeOnly
        clearable={clearable}
        className="w-full"
      >
        <DatePickerMaskedInput
          state={state}
          placeholder={placeholder ?? "HH:MM"}
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
        <DatePickerTimeContent />
      </DatePicker>
      <FormError message={errorMessage} />
    </div>
  );
}
