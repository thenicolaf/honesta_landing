"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../Select";

type FormSelectOption =
  | string
  | { value: string; label: string; disabled?: boolean };

interface FormSelectProps {
  id?: string;
  name: string;
  /** Controlled value — when provided, component is fully controlled. */
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: FormSelectOption[];
  state?: "default" | "error";
  clearable?: boolean;
  className?: string;
  /** Extra classes applied to the trigger button. */
  triggerClassName?: string;
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;
}

export function FormSelect({
  id,
  name,
  value: controlledValue,
  defaultValue = "",
  placeholder = "Select…",
  options,
  state,
  clearable = false,
  className,
  triggerClassName,
  onValueChange,
}: FormSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  };

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o, disabled: false } : o,
  );

  return (
    <div className={className}>
      <input type="hidden" id={id} name={name} value={value} />
      <Select
        value={value}
        onValueChange={handleChange}
        options={normalized}
        clearable={clearable}
      >
        <SelectTrigger
          className={cn(
            "w-full rounded-xl px-4 h-10 text-sm bg-cream",
            triggerClassName,
            state === "error"
              ? "border-red-400 focus-visible:ring-red-300/40"
              : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(opts) =>
            opts.map((o) => (
              <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  );
}
