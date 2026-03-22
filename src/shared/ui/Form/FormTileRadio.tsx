"use client";

import { createContext, useContext, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

// ─── Context ──────────────────────────────────────────────────────────────────

type TileSize = "sm" | "md";

interface FormTileRadioContextValue {
  value: string;
  onValueChange: (value: string) => void;
  size: TileSize;
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
  size?: TileSize;
}

export function FormTileRadio({
  children,
  name,
  className,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  size = "md",
}: FormTileRadioProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue ?? internalValue;

  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <FormTileRadioContext.Provider
      value={{ value, onValueChange: handleChange, size }}
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
    "font-body font-semibold uppercase tracking-[0.12em]",
    "rounded-xl border text-center",
    "cursor-pointer select-none transition-colors duration-200",
  ],
  {
    variants: {
      active: {
        true: "bg-earth text-cream border-earth",
        false:
          "bg-cream text-earth/60 border-earth/20 hover:text-earth hover:border-earth/40",
      },
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-4 py-2.5 text-2xs",
      },
    },
    defaultVariants: { active: false, size: "md" },
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
  const { value: selected, onValueChange, size } = useFormTileRadio();
  const isActive = selected === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onValueChange(value)}
      className={cn(itemVariants({ active: isActive, size }), className)}
    >
      {children}
    </button>
  );
}
