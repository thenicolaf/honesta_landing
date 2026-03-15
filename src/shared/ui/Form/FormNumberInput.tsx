"use client";

import { useState, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { Button } from "../Button";
import { IconPlus, IconMinus } from "@/shared/icons";

interface FormNumberInputProps {
  id?: string;
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  state?: "default" | "error";
  className?: string;
}

export function FormNumberInput({
  id,
  name,
  defaultValue = "",
  placeholder = "0",
  min,
  max,
  step = 1,
  state,
  className,
}: FormNumberInputProps) {
  const [value, setValue] = useState(String(defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  const numValue = parseFloat(value) || 0;
  const canDecrement = min === undefined || numValue - step >= min;
  const canIncrement = max === undefined || numValue + step <= max;

  const clamp = (n: number) => {
    let v = parseFloat(n.toFixed(10));
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return String(v);
  };

  const decrement = () => {
    if (!canDecrement) return;
    setValue(clamp(numValue - step));
  };

  const increment = () => {
    if (!canIncrement) return;
    setValue(clamp(numValue + step));
  };

  return (
    <div
      className={cn(
        "flex items-center h-10 rounded-xl border bg-cream transition-colors",
        state === "error"
          ? "border-red-400 focus-within:border-red-500"
          : "border-parchment focus-within:border-orange",
        className,
      )}
    >
      <Button
        as="button"
        type="button"
        tabIndex={-1}
        onClick={decrement}
        disabled={!canDecrement}
        variant="text"
        color="default"
        size="icon"
        className="shrink-0 rounded-l-xl rounded-r-none"
      >
        <IconMinus className="w-4 h-4" />
      </Button>

      <input
        ref={inputRef}
        id={id}
        type="number"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full min-w-0 bg-transparent py-0 text-center",
          "font-body font-light text-sm text-earth placeholder:text-earth/30",
          "focus:outline-none",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />

      <Button
        as="button"
        type="button"
        tabIndex={-1}
        onClick={increment}
        disabled={!canIncrement}
        variant="text"
        color="default"
        size="icon"
        className="shrink-0 rounded-r-xl rounded-l-none"
      >
        <IconPlus className="w-4 h-4" />
      </Button>
    </div>
  );
}
