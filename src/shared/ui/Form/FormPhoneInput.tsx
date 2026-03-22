"use client";

import { useState } from "react";
import { formatPhoneDisplay, normalizePhone } from "@/shared/utils/validatePhone";
import { FormInput } from "./FormInput";
import type { FieldVariantProps } from "./shared";

interface FormPhoneInputProps extends FieldVariantProps {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Phone input that displays a user-friendly local format (0XX XXX XXXX)
 * and submits the normalized +971XXXXXXXXX value via a hidden input.
 */
export function FormPhoneInput({
  name,
  id,
  defaultValue,
  placeholder = "050 123 4567",
  state,
  className,
}: FormPhoneInputProps) {
  const [display, setDisplay] = useState(() =>
    defaultValue ? formatPhoneDisplay(defaultValue) : "",
  );

  const normalized = normalizePhone(display);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/[^\d\s+]/g, "");
    setDisplay(formatPhoneDisplay(cleaned));
  }

  function handleBlur() {
    if (display.trim()) {
      setDisplay(formatPhoneDisplay(display));
    }
  }

  return (
    <>
      <input type="hidden" name={name} value={normalized} />
      <FormInput
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        state={state}
        className={className}
      />
    </>
  );
}
