"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { PartnershipInquiry } from "./types";

export function useRealtimeInquiries(initial: PartnershipInquiry[]) {
  const [inquiries, setInquiries] = useState(initial);
  const supabaseRef = useRef(createSupabaseBrowserClient());

  useEffect(() => {
    setInquiries(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("admin-partnerships")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "partnership_inquiries" },
        (payload) => {
          setInquiries((prev) => [payload.new as PartnershipInquiry, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "partnership_inquiries" },
        (payload) => {
          const row = payload.new as PartnershipInquiry;
          setInquiries((prev) =>
            prev.map((i) => (i.id === row.id ? row : i)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "partnership_inquiries" },
        (payload) => {
          const row = payload.old as { id: string };
          setInquiries((prev) => prev.filter((i) => i.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return inquiries;
}
