"use client";

import { useCallback, useRef } from "react";
import { toastInfo } from "@/shared/ui";
import type { Notification } from "@/lib/notificationsDb";
import { formatNotificationMessage } from "../filters";

/**
 * Returns a `tryToast(n)` function that fires `toastInfo` for each notification
 * at most once per session. Used by polling side-effects so `since`-poll +
 * window focus refetch can both surface the same id without showing a duplicate
 * toast to the user.
 */
export function useToastDeduplicator() {
  const seenRef = useRef<Set<string>>(new Set());
  return useCallback((n: Notification) => {
    if (seenRef.current.has(n.id)) return;
    seenRef.current.add(n.id);
    toastInfo(formatNotificationMessage(n));
  }, []);
}
