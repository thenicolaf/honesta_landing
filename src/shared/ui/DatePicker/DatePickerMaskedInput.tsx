"use client";

import { useMemo } from "react";
import { useMaskito } from "@maskito/react";
import { FormInput } from "../Form/FormInput";
import { useDatePicker } from "./context";
import { buildMaskOptions, generatePlaceholder } from "./mask";
import { useMaskedDateSync } from "./hooks/useMaskedDateSync";

interface DatePickerMaskedInputProps {
  placeholder?: string;
  className?: string;
  state?: "default" | "error";
  startIcon?: React.ReactNode;
}

export function DatePickerMaskedInput({
  placeholder,
  className,
  state,
  startIcon,
}: DatePickerMaskedInputProps) {
  const { value, format, clearable, selectDate, clear } = useDatePicker();

  const maskOptions = useMemo(() => buildMaskOptions(format), [format]);
  const maskRef = useMaskito({ options: maskOptions });

  const { localDisplay, handleInput, handleClear } = useMaskedDateSync(
    value,
    format,
    selectDate,
    clear,
  );

  return (
    <FormInput
      ref={maskRef}
      value={localDisplay}
      onInput={handleInput}
      placeholder={placeholder ?? generatePlaceholder(format)}
      autoComplete="off"
      startIcon={startIcon}
      clearable={clearable && localDisplay.length > 0}
      onClear={handleClear}
      state={state}
      className={className}
    />
  );
}
