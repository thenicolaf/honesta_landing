"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";
import { IconCheck } from "@/shared/icons";

const sizeMap = {
  sm: { size: "w-3.5 h-3.5", radius: "rounded", icon: "w-2.5 h-2.5" },
  md: { size: "w-4.5 h-4.5", radius: "rounded-md", icon: "w-3 h-3" },
  lg: { size: "w-5.5 h-5.5", radius: "rounded-md", icon: "w-3.5 h-3.5" },
} as const;

const boxVariants = cva(
  "shrink-0 border-2 transition-colors flex items-center justify-center",
  {
    variants: {
      checked: {
        true: "bg-orange border-orange",
        false: "bg-cream border-parchment",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    compoundVariants: [
      {
        checked: false,
        disabled: false,
        className: "hover:border-orange/50",
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
);

type Size = keyof typeof sizeMap;

interface CheckboxProps extends Omit<
  React.ComponentPropsWithRef<"input">,
  "type" | "size"
> {
  size?: Size;
  label?: React.ReactNode;
}

export function Checkbox({
  className,
  size = "md",
  label,
  id,
  ref,
  checked,
  disabled,
  ...props
}: CheckboxProps) {
  const s = sizeMap[size];

  const content = (
    <span
      className={cn(
        "relative inline-flex items-center justify-center leading-none align-middle",
        s.size,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer absolute inset-0 opacity-0 cursor-[inherit]"
        {...props}
      />
      <span
        className={cn(
          boxVariants({ checked: !!checked, disabled: !!disabled }),
          "absolute inset-0",
          s.radius,
        )}
      >
        {checked && <IconCheck className={cn(s.icon, "text-white-warm")} />}
      </span>
    </span>
  );

  if (!label) return content;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex w-max items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      {content}
      <span className="font-body text-sm text-earth/70">{label}</span>
    </label>
  );
}
