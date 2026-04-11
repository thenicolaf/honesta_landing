"use client";

import { useState } from "react";
import { Checkbox } from "../Checkbox";

interface FormCheckboxProps {
  id?: string;
  name: string;
  label?: React.ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function FormCheckbox({
  id,
  name,
  label,
  defaultChecked,
  checked: controlledChecked,
  onChange,
  disabled,
  className,
}: FormCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  return (
    <>
      <input type="hidden" name={name} value={String(checked)} />
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        label={label}
        className={className}
        onChange={(e) => {
          if (!isControlled) setInternalChecked(e.target.checked);
          onChange?.(e);
        }}
      />
    </>
  );
}
