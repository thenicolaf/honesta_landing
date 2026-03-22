"use client";

import { useState, useRef, useCallback } from "react";

export const DIGIT_COUNT = 6;
const EMPTY_DIGITS = Array.from({ length: DIGIT_COUNT }, () => "");

export function useOtpHandlers(onComplete: (code: string) => void, defaultValue?: string) {
  const [digits, setDigits] = useState<string[]>(() =>
    defaultValue
      ? defaultValue.split("").concat([...EMPTY_DIGITS]).slice(0, DIGIT_COUNT)
      : [...EMPTY_DIGITS],
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const emitIfComplete = useCallback(
    (next: string[]) => {
      const code = next.join("");
      if (code.length === DIGIT_COUNT) onComplete(code);
    },
    [onComplete],
  );

  const updateDigit = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);

      if (digit && index < DIGIT_COUNT - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      emitIfComplete(next);
    },
    [digits, emitIfComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, DIGIT_COUNT);
      if (!pasted) return;

      const next = [...EMPTY_DIGITS];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);

      const focusIndex = Math.min(pasted.length, DIGIT_COUNT - 1);
      inputsRef.current[focusIndex]?.focus();

      emitIfComplete(next);
    },
    [emitIfComplete],
  );

  return { digits, inputsRef, updateDigit, handleKeyDown, handlePaste } as const;
}
