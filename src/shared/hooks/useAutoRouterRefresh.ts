"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME_MS } from "@/providers";

const REFRESH_THROTTLE_MS = 3_000;

/**
 * Periodically calls `router.refresh()` so a server-rendered admin table
 * picks up new server-side mutations without a full reload. Replaces the
 * pattern of subscribing to Supabase Realtime on a single table.
 *
 * Implemented as a TanStack Query hook so we get `refetchInterval`,
 * `refetchOnWindowFocus`, `refetchOnReconnect`, throttle (via `staleTime`),
 * and tab-hidden gating for free.
 *
 * - `queryFn` triggers `router.refresh()` as a side effect; the actual
 *   returned data is unused (`null`).
 * - `isFirstRef` skips the very first invocation on mount — the page just
 *   server-rendered with fresh data, so an immediate refresh is wasted.
 * - `staleTime: 3s` makes window focus / visibility refetches throttle to
 *   once per 3 seconds, even if the user rapidly toggles tabs.
 * - `gcTime: 0` clears the cache on unmount so a remount re-arms the
 *   first-skip behaviour.
 *
 * @param queryKey  Stable cache key. Each call site should pass a unique
 *                  key (e.g. `["panel-orders-refresh"]`) so the queries
 *                  don't share a TanStack Query observer with another page.
 */
export function useAutoRouterRefresh(queryKey: readonly unknown[]) {
  const router = useRouter();
  const isFirstRef = useRef(true);

  useQuery({
    queryKey,
    queryFn: async () => {
      if (isFirstRef.current) {
        isFirstRef.current = false;
        return null;
      }
      router.refresh();
      return null;
    },
    refetchInterval: DEFAULT_STALE_TIME_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: REFRESH_THROTTLE_MS,
    gcTime: 0,
  });
}
