"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Shared "data is fresh for this long" window — 30 seconds.
 *
 * Used as the default `staleTime` for TanStack Query and reused by individual
 * query hooks that want to match the global cadence (notifications list,
 * admin order auto-refresh, etc.). Bumping this in one place tunes refetch
 * frequency across the app.
 */
export const DEFAULT_STALE_TIME_MS = 30_000;

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            staleTime: DEFAULT_STALE_TIME_MS,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
