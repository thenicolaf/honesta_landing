"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { AdminOrder } from "@/pages_flow/orders/types";

export function useRealtimeOrders(initial: AdminOrder[]) {
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseRef.current;

    // New orders are always created with status=PENDING and filtered out
    // server-side, so INSERT events can be ignored — the order will show up
    // via the UPDATE that flips status to PAID/FAILED/CANCELLED.
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return initial;
}
