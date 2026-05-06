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
    "select-none transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        active: "bg-earth text-cream border-earth cursor-pointer",
        idle:
          "bg-cream text-earth/60 border-earth/20 hover:text-earth hover:border-earth/40 cursor-pointer",
        disabled:
          "bg-cream/40 text-earth/30 border-dashed border-earth/10 cursor-not-allowed",
      },
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-4 py-2.5 text-2xs",
      },
    },
    defaultVariants: { state: "idle", size: "md" },
  },
);

interface FormTileRadioItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

export function FormTileRadioItem({
  children,
  value,
  className,
  disabled = false,
}: FormTileRadioItemProps) {
  const { value: selected, onValueChange, size } = useFormTileRadio();
  const isActive = selected === value;
  const state = disabled ? "disabled" : isActive ? "active" : "idle";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onValueChange(value);
      }}
      className={cn(itemVariants({ state, size }), className)}
    >
      {children}
    </button>
  );
}
