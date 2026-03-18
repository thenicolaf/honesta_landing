"use client";

import { createContext, useContext, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

// ─── Context ──────────────────────────────────────────────────────────────────

interface FormTileRadioContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const FormTileRadioContext = createContext<FormTileRadioContextValue | null>(
  null,
);

function useFormTileRadio() {
  const ctx = useContext(FormTileRadioContext);
  if (!ctx)
    throw new Error(
      "useFormTileRadio must be used within <FormTileRadio>",
    );
  return ctx;
}

// ─── FormTileRadio ────────────────────────────────────────────────────────────

interface FormTileRadioProps {
  children: React.ReactNode;
  name: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function FormTileRadio({
  children,
  name,
  className,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
}: FormTileRadioProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue ?? internalValue;

  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <FormTileRadioContext.Provider
      value={{ value, onValueChange: handleChange }}
    >
      <input type="hidden" name={name} value={value} />
      <div role="radiogroup" className={cn("flex gap-2", className)}>
        {children}
      </div>
    </FormTileRadioContext.Provider>
  );
}

// ─── FormTileRadioItem ────────────────────────────────────────────────────────

const itemVariants = cva(
  [
    "font-body font-semibold text-2xs uppercase tracking-[0.12em]",
    "flex-1 px-4 py-2.5 rounded-xl border text-center",
    "cursor-pointer select-none transition-colors duration-200",
  ],
  {
    variants: {
      active: {
        true: "bg-earth text-cream border-earth",
        false:
          "bg-cream text-earth/60 border-earth/20 hover:text-earth hover:border-earth/40",
      },
    },
    defaultVariants: { active: false },
  },
);

interface FormTileRadioItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function FormTileRadioItem({
  children,
  value,
  className,
}: FormTileRadioItemProps) {
  const { value: selected, onValueChange } = useFormTileRadio();
  const isActive = selected === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onValueChange(value)}
      className={cn(itemVariants({ active: isActive }), className)}
    >
      {children}
    </button>
  );
}
