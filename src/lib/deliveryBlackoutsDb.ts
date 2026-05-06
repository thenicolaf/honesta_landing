import { cache } from "react";
import { supabaseAdmin } from "./supabase.server";
import { format } from "date-fns";

export type DeliveryBlackout = {
  id: string;
  blackout_date: string;
  slot_id: string | null;
  reason: string | null;
  created_at: string;
};

const SELECT_COLUMNS = "id, blackout_date, slot_id, reason, created_at";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getDeliveryBlackouts = cache(
  async (): Promise<DeliveryBlackout[]> => {
    const todayIso = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabaseAdmin
      .from("delivery_blackouts")
      .select(SELECT_COLUMNS)
      .gte("blackout_date", todayIso)
      .order("blackout_date", { ascending: true });
    return (data ?? []) as DeliveryBlackout[];
  },
);

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function insertDeliveryBlackout(input: {
  blackout_date: string;
  slot_id: string | null;
  reason: string | null;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("delivery_blackouts")
    .insert(input)
    .select("id")
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateDeliveryBlackout(
  id: string,
  input: {
    blackout_date: string;
    slot_id: string | null;
    reason: string | null;
  },
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("delivery_blackouts")
    .update(input)
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteDeliveryBlackout(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("delivery_blackouts")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
