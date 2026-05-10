import { cache } from "react";
import { supabaseAdmin } from "./supabase.server";
import { deleteImage } from "./storage";

export type MarketingPopup = {
  id: string;
  is_active: boolean;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MarketingPopupInput = {
  is_active: boolean;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export function isMarketingPopupActive(
  popup: MarketingPopup | null,
  now: Date = new Date(),
): boolean {
  if (!popup?.is_active) return false;
  if (!popup.title.trim()) return false;
  if (popup.starts_at && new Date(popup.starts_at) > now) return false;
  if (popup.ends_at && new Date(popup.ends_at) <= now) return false;
  return true;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const getMarketingPopups = cache(
  async (): Promise<MarketingPopup[]> => {
    const { data } = await supabaseAdmin
      .from("marketing_popup")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []) as MarketingPopup[];
  },
);

export const getActiveMarketingPopup = cache(
  async (): Promise<MarketingPopup | null> => {
    const { data } = await supabaseAdmin
      .from("marketing_popup")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    return (data as MarketingPopup) ?? null;
  },
);

export async function getMarketingPopupById(
  id: string,
): Promise<MarketingPopup | null> {
  const { data } = await supabaseAdmin
    .from("marketing_popup")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as MarketingPopup) ?? null;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

async function deactivateAll(): Promise<void> {
  await supabaseAdmin
    .from("marketing_popup")
    .update({ is_active: false })
    .eq("is_active", true);
}

export async function createMarketingPopup(
  data: MarketingPopupInput,
): Promise<{ id: string | null; error: string | null }> {
  if (data.is_active) {
    await deactivateAll();
  }
  const { data: row, error } = await supabaseAdmin
    .from("marketing_popup")
    .insert(data)
    .select("id")
    .single();

  return {
    id: (row as { id: string } | null)?.id ?? null,
    error: error?.message ?? null,
  };
}

export async function updateMarketingPopup(
  id: string,
  data: MarketingPopupInput,
): Promise<{ error: string | null }> {
  if (data.is_active) {
    await supabaseAdmin
      .from("marketing_popup")
      .update({ is_active: false })
      .eq("is_active", true)
      .neq("id", id);
  }

  const { error } = await supabaseAdmin
    .from("marketing_popup")
    .update(data)
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteMarketingPopup(
  id: string,
): Promise<{ error?: string }> {
  const { data: existing } = await supabaseAdmin
    .from("marketing_popup")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("marketing_popup")
    .delete()
    .eq("id", id);

  if (error) return { error: "Failed to delete popup." };

  const imageUrl = (existing as { image_url: string | null } | null)?.image_url;
  if (imageUrl) await deleteImage(imageUrl, "marketing");

  return {};
}

export async function setMarketingPopupActive(
  id: string,
  active: boolean,
): Promise<{ error: string | null }> {
  if (active) {
    await supabaseAdmin
      .from("marketing_popup")
      .update({ is_active: false })
      .eq("is_active", true)
      .neq("id", id);
  }

  const { error } = await supabaseAdmin
    .from("marketing_popup")
    .update({ is_active: active })
    .eq("id", id);

  return { error: error?.message ?? null };
}
