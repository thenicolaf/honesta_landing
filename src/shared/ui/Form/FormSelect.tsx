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

type FormSelectOption = string | { value: string; label: string };

interface FormSelectProps {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  options: FormSelectOption[];
  state?: "default" | "error";
  clearable?: boolean;
  className?: string;
}

export function FormSelect({
  id,
  name,
  defaultValue = "",
  placeholder = "Select…",
  options,
  state,
  clearable = false,
  className,
}: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  return (
    <div className={className}>
      <input type="hidden" id={id} name={name} value={value} />
      <Select
        value={value}
        onValueChange={setValue}
        options={normalized}
        clearable={clearable}
      >
        <SelectTrigger
          className={cn(
            "w-full rounded-xl px-4 h-10 text-sm bg-cream",
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
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  );
}
