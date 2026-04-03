"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { AdminOrder } from "@/pages_flow/orders/types";

export function useRealtimeOrders(initial: AdminOrder[]) {
  const [orders, setOrders] = useState(initial);
  const supabaseRef = useRef(createSupabaseBrowserClient());

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
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const order: AdminOrder = {
            id: row.id as string,
            status: row.status as string,
            subtotal: row.subtotal as number,
            delivery_fee: row.delivery_fee as number,
            total: row.total as number,
            address: row.address as string,
            created_at: row.created_at as string,
            first_name: row.first_name as string,
            last_name: row.last_name as string,
            email: row.email as string,
            phone: row.phone as string,
            notes: (row.notes as string) ?? null,
            gender: null,
            birthday: null,
            is_fulfilled: (row.is_fulfilled as boolean) ?? false,
            order_items: [],
          };
          setOrders((prev) => [order, ...prev]);
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
                    is_fulfilled: (row.is_fulfilled as boolean) ?? o.is_fulfilled,
                    total: (row.total as number) ?? o.total,
                    subtotal: (row.subtotal as number) ?? o.subtotal,
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
  }, []);

  return orders;
}
