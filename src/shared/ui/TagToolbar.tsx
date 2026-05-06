"use client";

import { createContext, useContext, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

// ─── Item variants (shared by single/multi) ──────────────────────────────────

export const tagToolbarItemVariants = cva(
  [
    "font-body font-semibold uppercase tracking-[0.12em] text-2xs",
    "px-4 py-1.5 rounded-full border whitespace-nowrap cursor-pointer select-none",
    "transition-colors duration-200",
  ],
  {
    variants: {
      active: {
        true: "bg-earth text-cream border-earth",
        false:
          "bg-transparent text-earth/60 border-earth/20 hover:text-earth hover:border-earth/50",
      },
    },
    defaultVariants: { active: false },
  },
);

// ─── Single-select context ───────────────────────────────────────────────────

interface TagToolbarContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TagToolbarContext = createContext<TagToolbarContextValue | null>(null);

export function useTagToolbar() {
  const ctx = useContext(TagToolbarContext);
  if (!ctx) throw new Error("useTagToolbar must be used within <TagToolbar>");
  return ctx;
}

// ─── TagToolbar (single-select) ──────────────────────────────────────────────

interface TagToolbarProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function TagToolbar({
  children,
  className,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
}: TagToolbarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue ?? internalValue;

  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <TagToolbarContext.Provider value={{ value, onValueChange: handleChange }}>
      <div role="radiogroup" className={cn("flex flex-wrap gap-2", className)}>
        {children}
      </div>
    </TagToolbarContext.Provider>
  );
}

interface TagToolbarItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function TagToolbarItem({ children, value, className }: TagToolbarItemProps) {
  const { value: selected, onValueChange } = useTagToolbar();
  const isActive = selected === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onValueChange(value)}
      className={cn(tagToolbarItemVariants({ active: isActive }), className)}
    >
      {children}
    </button>
  );
}

// ─── Multi-select context ────────────────────────────────────────────────────

interface TagToolbarMultiContextValue {
  values: ReadonlySet<string>;
  toggle: (value: string) => void;
}

const TagToolbarMultiContext = createContext<TagToolbarMultiContextValue | null>(
  null,
);

export function useTagToolbarMulti() {
  const ctx = useContext(TagToolbarMultiContext);
  if (!ctx)
    throw new Error("useTagToolbarMulti must be used within <TagToolbarMulti>");
  return ctx;
}

// ─── TagToolbarMulti ─────────────────────────────────────────────────────────

interface TagToolbarMultiProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: readonly string[];
  value?: readonly string[];
  onValueChange?: (values: string[]) => void;
}

export function TagToolbarMulti({
  children,
  className,
  defaultValue = [],
  value: controlledValue,
  onValueChange,
}: TagToolbarMultiProps) {
  const [internalValues, setInternalValues] = useState<Set<string>>(
    () => new Set(defaultValue),
  );

  const values =
    controlledValue !== undefined ? new Set(controlledValue) : internalValues;

  const toggle = (v: string) => {
    const next = new Set(values);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    if (controlledValue === undefined) setInternalValues(next);
    onValueChange?.(Array.from(next));
  };

  return (
    <TagToolbarMultiContext.Provider value={{ values, toggle }}>
      <div role="group" className={cn("flex flex-wrap gap-2", className)}>
        {children}
      </div>
    </TagToolbarMultiContext.Provider>
  );
}

interface TagToolbarMultiItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function TagToolbarMultiItem({
  children,
  value,
  className,
}: TagToolbarMultiItemProps) {
  const { values, toggle } = useTagToolbarMulti();
  const isActive = values.has(value);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isActive}
      onClick={() => toggle(value)}
      className={cn(tagToolbarItemVariants({ active: isActive }), className)}
    >
      {children}
    </button>
  );
}
