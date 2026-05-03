import { cache } from "react";
import { supabaseAdmin } from "./supabase.server";

export {
  findSlotConflict,
  getAvailableSlotsForDate,
} from "@/shared/utils/deliverySlots";
export type { SlotConflict } from "@/shared/utils/deliverySlots";

export type DeliverySlot = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: number[];
  created_at: string;
  updated_at: string;
};

export type DeliverySlotInput = {
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  available_weekdays: number[];
};

const SELECT_COLUMNS =
  "id, label, start_time, end_time, is_active, available_weekdays, created_at, updated_at";

// ─── Queries ────────────────────────────────────────────────────────────────

export const getDeliverySlots = cache(async (): Promise<DeliverySlot[]> => {
  const { data } = await supabaseAdmin
    .from("delivery_slots")
    .select(SELECT_COLUMNS)
    .order("start_time", { ascending: true });
  return (data ?? []) as DeliverySlot[];
});

export const getActiveDeliverySlots = cache(
  async (): Promise<DeliverySlot[]> => {
    const { data } = await supabaseAdmin
      .from("delivery_slots")
      .select(SELECT_COLUMNS)
      .eq("is_active", true)
      .order("start_time", { ascending: true });
    return (data ?? []) as DeliverySlot[];
  },
);

export async function getDeliverySlotById(
  id: string,
): Promise<DeliverySlot | null> {
  const { data } = await supabaseAdmin
    .from("delivery_slots")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .single();
  return (data as DeliverySlot) ?? null;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function insertDeliverySlot(
  input: DeliverySlotInput,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("delivery_slots")
    .insert(input)
    .select("id")
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateDeliverySlot(
  id: string,
  input: DeliverySlotInput,
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("delivery_slots")
    .update(input)
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteDeliverySlot(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("delivery_slots")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
