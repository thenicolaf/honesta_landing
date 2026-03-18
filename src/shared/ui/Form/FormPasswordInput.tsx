"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { IconEye, IconEyeOff } from "@/shared/icons";
import { FormInput } from "./FormInput";
import type { FieldVariantProps } from "./shared";

interface FormPasswordInputProps
  extends
    Omit<React.ComponentPropsWithRef<"input">, "type">,
    FieldVariantProps {}

export function FormPasswordInput({
  className,
  ...props
}: FormPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FormInput
        type={visible ? "text" : "password"}
        data-visible={visible || undefined}
        className={cn(
          "pr-10",
          "text-xl font-bold tracking-widest py-0 h-10 leading-10",
          "data-visible:not-placeholder-shown:text-sm data-visible:not-placeholder-shown:font-light data-visible:not-placeholder-shown:tracking-normal",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-earth/35 hover:text-earth/70 transition-colors duration-150 cursor-pointer"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <IconEyeOff className="w-4 h-4" />
        ) : (
          <IconEye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
