"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { AdminOrder } from "@/pages_flow/orders/types";

export function useRealtimeOrders(initial: AdminOrder[]) {
  const [orders, setOrders] = useState(initial);
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const router = useRouter();

  useEffect(() => {
    setOrders(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          // The `orders` insert fires before `order_items` land in the DB
          // (they're written in a separate insert by createOrderWithItems),
          // so we can't safely merge the row here. Instead, re-run the
          // server component which already selects the full shape with
          // order_items + promo_code join.
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === row.id
                ? {
                    ...o,
                    status: row.status as string,
                    is_fulfilled:
                      (row.is_fulfilled as boolean) ?? o.is_fulfilled,
                    total: (row.total as number) ?? o.total,
                    subtotal: (row.subtotal as number) ?? o.subtotal,
                    promotion_discount:
                      (row.promotion_discount as number) ??
                      o.promotion_discount,
                  }
                : o,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.old as Record<string, unknown>;
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return orders;
}
