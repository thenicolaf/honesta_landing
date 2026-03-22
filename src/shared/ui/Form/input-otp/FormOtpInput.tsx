"use client";

import { cn } from "@/shared/utils/cn";
import { useOtpHandlers } from "./useOtpHandlers";

interface FormOtpInputProps {
  /** Called with the full code string when all 6 digits are filled */
  onComplete: (code: string) => void;
  /** Pre-fill digits (e.g. to restore after a failed submission) */
  defaultValue?: string;
  /** Whether to auto-focus the first input on mount */
  autoFocus?: boolean;
  /** Additional class for each digit input */
  className?: string;
}

export function FormOtpInput({
  onComplete,
  defaultValue,
  autoFocus = true,
  className,
}: FormOtpInputProps) {
  const { digits, inputsRef, updateDigit, handleKeyDown, handlePaste } =
    useOtpHandlers(onComplete, defaultValue);

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => updateDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "w-11 h-13 text-center text-lg font-body font-light text-earth border border-parchment rounded-xl bg-cream focus:border-orange focus:outline-none transition-colors",
            className,
          )}
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </div>
  );
}
