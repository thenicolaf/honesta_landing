"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { IconX } from "@/shared/icons";
import { fieldVariants, type FieldVariantProps } from "./shared";

interface FormInputProps
  extends React.ComponentPropsWithRef<"input">, FieldVariantProps {
  startIcon?: React.ReactNode;
  wrapperClassName?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export function FormInput({
  className,
  wrapperClassName,
  state,
  ref,
  startIcon,
  clearable = false,
  onClear,
  value,
  ...props
}: FormInputProps) {
  const showClear = clearable && !!value;

  return (
    <div className={cn("relative", wrapperClassName)}>
      {startIcon && (
        <div className="absolute inline-flex left-3 top-1/2 -translate-y-1/2 text-earth/40 pointer-events-none">
          {startIcon}
        </div>
      )}
      <input
        ref={ref}
        value={value}
        className={cn(
          fieldVariants({ state }),
          "h-10",
          startIcon && "pl-9",
          clearable && "pr-9",
          className,
        )}
        {...props}
      />
      <AnimatePresence initial={false}>
        {showClear && (
          <motion.button
            key="clear"
            type="button"
            tabIndex={-1}
            onClick={onClear}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 p-0.5 rounded-full text-earth/35 hover:text-earth/70 hover:bg-earth/8 transition-colors duration-150"
            aria-label="Clear"
          >
            <IconX className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
