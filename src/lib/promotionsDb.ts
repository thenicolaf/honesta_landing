import { supabaseAdmin } from "./supabase.server";

export type Promotion = {
  id: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
};

export type PromotionWithProducts = Promotion & {
  product_ids: string[];
};

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getPromotions(): Promise<Promotion[]> {
  const { data } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Promotion[];
}

export async function getPromotionById(
  id: string,
): Promise<PromotionWithProducts | null> {
  const { data: promotion } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .eq("id", id)
    .single();

  if (!promotion) return null;

  const { data: links } = await supabaseAdmin
    .from("promotion_products")
    .select("product_id")
    .eq("promotion_id", id);

  return {
    ...(promotion as Promotion),
    product_ids: (links ?? []).map((l) => l.product_id),
  };
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function createPromotion(
  data: Omit<Promotion, "id" | "created_at">,
  productIds: string[],
): Promise<{ id?: string; error?: string }> {
  const { data: promotion, error } = await supabaseAdmin
    .from("promotions")
    .insert({
      name: data.name,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: data.is_active,
    })
    .select("id")
    .single();

  if (error || !promotion) {
    return { error: "Failed to create promotion." };
  }

  if (productIds.length > 0) {
    await supabaseAdmin.from("promotion_products").insert(
      productIds.map((pid) => ({
        promotion_id: promotion.id,
        product_id: pid,
      })),
    );
  }

  return { id: promotion.id };
}

export async function updatePromotion(
  id: string,
  data: Omit<Promotion, "id" | "created_at">,
  productIds: string[],
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("promotions")
    .update({
      name: data.name,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: "Failed to update promotion." };

  // Sync products
  await supabaseAdmin
    .from("promotion_products")
    .delete()
    .eq("promotion_id", id);

  if (productIds.length > 0) {
    await supabaseAdmin.from("promotion_products").insert(
      productIds.map((pid) => ({
        promotion_id: id,
        product_id: pid,
      })),
    );
  }

  return {};
}

export async function deletePromotion(
  id: string,
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("promotions")
    .delete()
    .eq("id", id);

  if (error) return { error: "Failed to delete promotion." };
  return {};
}
