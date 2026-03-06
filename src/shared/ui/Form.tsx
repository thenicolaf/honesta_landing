"use client";

import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./Select";

const labelVariants = cva(
  "font-body font-semibold text-earth text-xs uppercase tracking-[0.12em] block mb-2",
);

const fieldVariants = cva(
  "w-full border rounded-xl px-4 py-3 font-body font-light text-earth bg-cream placeholder:text-earth/30 focus:outline-none transition-colors text-sm",
  {
    variants: {
      state: {
        default: "border-parchment focus:border-orange",
        error: "border-red-400 focus:border-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

type FieldVariantProps = VariantProps<typeof fieldVariants>;

export function FormLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn(labelVariants(), className)} {...props} />;
}

export function FormInput({
  className,
  state,
  ref,
  ...props
}: React.ComponentPropsWithRef<"input"> & FieldVariantProps) {
  return (
    <input ref={ref} className={cn(fieldVariants({ state }), className)} {...props} />
  );
}

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
      <Select value={value} onValueChange={setValue} clearable={clearable}>
        <SelectTrigger
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm bg-cream",
            state === "error"
              ? "border-red-400 focus-visible:ring-red-300/40"
              : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalized.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FormTextarea({
  className,
  state,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldVariantProps) {
  return (
    <textarea
      className={cn(fieldVariants({ state }), "resize-none", className)}
      {...props}
    />
  );
}

export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p className={cn("font-body  text-red-500 text-2xs mt-1", className)}>
      {message}
    </p>
  );
}
