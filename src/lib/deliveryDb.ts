import { cache } from "react";
import { supabaseAdmin } from "./supabase.server";

export type DeliverySetting = {
  id: string;
  emirate: string;
  delivery_fee: number;
  free_delivery_threshold: number | null;
  minimum_order: number | null;
  delivery_days: number;
  is_active: boolean;
  updated_at: string;
};

// ─── Queries ────────────────────────────────────────────────────────────────

export const getDeliverySettings = cache(async (): Promise<DeliverySetting[]> => {
  const { data } = await supabaseAdmin
    .from("delivery_settings")
    .select("*")
    .order("emirate");
  return (data ?? []) as DeliverySetting[];
});

export async function getDeliverySettingByEmirate(
  emirate: string,
): Promise<DeliverySetting | null> {
  const { data } = await supabaseAdmin
    .from("delivery_settings")
    .select("*")
    .eq("emirate", emirate)
    .single();
  return (data as DeliverySetting) ?? null;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function updateDeliverySetting(
  id: string,
  data: {
    delivery_fee: number;
    free_delivery_threshold: number | null;
    minimum_order: number | null;
    delivery_days: number;
    is_active: boolean;
  },
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("delivery_settings")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}
