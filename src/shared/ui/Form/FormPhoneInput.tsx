"use client";

import { forwardRef, useCallback, useState } from "react";
import PhoneInput from "react-phone-number-input/max";
import type { Value } from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { cn } from "@/shared/utils/cn";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../Select";
import type { FieldVariantProps } from "./shared";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormPhoneInputProps extends FieldVariantProps {
  name: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

interface CountryOption {
  value?: string;
  label: string;
  divider?: boolean;
}

// ─── Custom input (styled with fieldVariants) ────────────────────────────────

const CustomInput = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(function CustomInput({ className, value, onChange, ...props }, ref) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prev = String(value ?? "");
    const next = e.target.value;
    const prevDigits = prev.replace(/\D/g, "");
    const nextDigits = next.replace(/\D/g, "");

    if (
      nextDigits.length > prevDigits.length &&
      prevDigits.length > 0 &&
      isValidPhoneNumber("+" + prevDigits)
    ) {
      e.preventDefault();
      return;
    }
    onChange?.(e);
  };

  return (
    <input
      ref={ref}
      value={value}
      onChange={handleChange}
      className={cn(
        "flex-1 h-10 bg-transparent pr-3 font-body font-light text-earth text-sm",
        "placeholder:text-earth/30 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});

// ─── Custom country select (uses our Select compound component) ──────────────

function CountrySelect({
  value,
  onChange,
  options,
}: {
  value?: string;
  onChange: (value?: string) => void;
  options: CountryOption[];
}) {
  const countries = options.filter((o) => !o.divider && o.value);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val === "ZZ" ? undefined : val);
    },
    [onChange],
  );

  const flag = value ? getUnicodeFlagIcon(value) : "🌐";

  return (
    <Select
      value={value ?? "ZZ"}
      onValueChange={handleChange}
      className="static"
      searchable
      options={countries.map((c) => ({
        value: c.value!,
        label: c.label,
      }))}
    >
      <SelectTrigger className="w-auto gap-1 border-0! shadow-none! ring-0! rounded-l-xl! rounded-r-none! px-3 py-0 h-10 bg-transparent hover:bg-earth/4">
        <span className="text-lg leading-none">{flag}</span>
        <SelectValue placeholder="🌐" className="hidden" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {(options) =>
          options.map((c) => (
            <SelectItem key={c.value} value={c.value!}>
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">
                  {getUnicodeFlagIcon(c.value!)}
                </span>
                <span className="truncate">{c.label}</span>
              </span>
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}

// ─── FormPhoneInput ──────────────────────────────────────────────────────────

export function FormPhoneInput({
  name,
  id,
  defaultValue,
  value: controlledValue,
  onChange,
  placeholder,
  state,
  className,
}: FormPhoneInputProps) {
  const normalize = (raw?: string): Value | undefined =>
    raw ? (raw.replace(/\s/g, "") as Value) : undefined;

  const [internalValue, setInternalValue] = useState<Value | undefined>(() =>
    normalize(controlledValue || defaultValue),
  );
  // Track the last defaultValue we adopted so that when the parent passes a
  // new one (e.g. server action echoes submitted values back), we re-sync
  // internal state in-render — React's recommended pattern for deriving state
  // from props without effects.
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue);
    if (controlledValue === undefined) {
      setInternalValue(normalize(defaultValue));
    }
  }

  const value = controlledValue !== undefined
    ? (controlledValue.replace(/\s/g, "") as Value)
    : internalValue;

  const handleChange = (val?: Value) => {
    if (controlledValue === undefined) setInternalValue(val);
    onChange?.(val ?? undefined);
  };

  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border bg-cream transition-colors",
        "focus-within:border-orange",
        state === "error"
          ? "border-red-400 focus-within:border-red-500"
          : "border-parchment",
        className,
      )}
    >
      <PhoneInput
        id={id}
        name={name}
        defaultCountry="AE"
        international
        limitMaxLength
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        inputComponent={CustomInput}
        countrySelectComponent={CountrySelect}
        className="flex items-center flex-1 [&>.PhoneInputCountryIcon]:hidden"
      />
    </div>
  );
}
