"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_SECONDS = 60;

/**
 * Timer hook for OTP "Resend code" buttons.
 *
 * Returns `cooldown` (seconds remaining, 0 = ready),
 * and `startCooldown()` to kick off the countdown.
 */
export function useResendCooldown(seconds = DEFAULT_SECONDS) {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startCooldown = useCallback(() => {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { cooldown, startCooldown } as const;
}
