import { supabaseAdmin } from "./supabase.server";

export type PromoCodeScope = "cart" | "product";
export type PromoCodeDiscountType = "percentage" | "fixed";

export type PromoCode = {
  id: string;
  code: string;
  scope: PromoCodeScope;
  discount_type: PromoCodeDiscountType;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  stack_with_promotions: boolean;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type PromoCodeWithRelations = PromoCode & {
  product_ids: string[];
  user_ids: string[];
};

export type PromoCodeListItem = PromoCode & {
  used_count: number;
};

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getPromoCodes(): Promise<PromoCodeListItem[]> {
  const { data: codes } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (codes ?? []) as PromoCode[];
  if (list.length === 0) return [];

  const { data: redemptions } = await supabaseAdmin
    .from("promo_code_redemptions")
    .select("promo_code_id");

  const counts = new Map<string, number>();
  for (const r of (redemptions ?? []) as { promo_code_id: string }[]) {
    counts.set(r.promo_code_id, (counts.get(r.promo_code_id) ?? 0) + 1);
  }

  return list.map((c) => ({ ...c, used_count: counts.get(c.id) ?? 0 }));
}

export async function getPromoCodeById(
  id: string,
): Promise<PromoCodeWithRelations | null> {
  const { data: code } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .single();

  if (!code) return null;

  const [{ data: products }, { data: users }] = await Promise.all([
    supabaseAdmin
      .from("promo_code_products")
      .select("product_id")
      .eq("promo_code_id", id),
    supabaseAdmin
      .from("promo_code_users")
      .select("user_id")
      .eq("promo_code_id", id),
  ]);

  return {
    ...(code as PromoCode),
    product_ids: (products ?? []).map((p) => p.product_id),
    user_ids: (users ?? []).map((u) => u.user_id),
  };
}

export async function getPromoCodeByCode(
  code: string,
): Promise<PromoCodeWithRelations | null> {
  const { data: row } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .ilike("code", code)
    .single();

  if (!row) return null;
  return getPromoCodeById((row as PromoCode).id);
}

export async function getPromoCodeUsageCountTotal(
  promoCodeId: string,
): Promise<number> {
  const { count } = await supabaseAdmin
    .from("promo_code_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("promo_code_id", promoCodeId);
  return count ?? 0;
}

export async function getPromoCodeUsageCountByUser(
  promoCodeId: string,
  userId: string,
): Promise<number> {
  const { count } = await supabaseAdmin
    .from("promo_code_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("promo_code_id", promoCodeId)
    .eq("user_id", userId);
  return count ?? 0;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

type PromoCodeInput = Omit<PromoCode, "id" | "created_at">;

export async function createPromoCode(
  data: PromoCodeInput,
  productIds: string[],
  userIds: string[],
): Promise<{ id?: string; error?: string }> {
  const { data: existing } = await supabaseAdmin
    .from("promo_codes")
    .select("id")
    .ilike("code", data.code)
    .maybeSingle();
  if (existing) return { error: "Code already exists" };

  const { data: row, error } = await supabaseAdmin
    .from("promo_codes")
    .insert({
      code: data.code,
      scope: data.scope,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_amount: data.min_order_amount,
      max_uses: data.max_uses,
      max_uses_per_user: data.max_uses_per_user,
      stack_with_promotions: data.stack_with_promotions,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: data.is_active,
    })
    .select("id")
    .single();

  if (error || !row) return { error: "Failed to create promo code." };

  if (data.scope === "product" && productIds.length > 0) {
    await supabaseAdmin.from("promo_code_products").insert(
      productIds.map((pid) => ({
        promo_code_id: row.id,
        product_id: pid,
      })),
    );
  }

  if (userIds.length > 0) {
    await supabaseAdmin.from("promo_code_users").insert(
      userIds.map((uid) => ({
        promo_code_id: row.id,
        user_id: uid,
      })),
    );
  }

  return { id: row.id };
}

export async function updatePromoCode(
  id: string,
  data: PromoCodeInput,
  productIds: string[],
  userIds: string[],
): Promise<{ error?: string }> {
  const { data: existing } = await supabaseAdmin
    .from("promo_codes")
    .select("id")
    .ilike("code", data.code)
    .neq("id", id)
    .maybeSingle();
  if (existing) return { error: "Code already exists" };

  const { error } = await supabaseAdmin
    .from("promo_codes")
    .update({
      code: data.code,
      scope: data.scope,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_amount: data.min_order_amount,
      max_uses: data.max_uses,
      max_uses_per_user: data.max_uses_per_user,
      stack_with_promotions: data.stack_with_promotions,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: "Failed to update promo code." };

  await supabaseAdmin
    .from("promo_code_products")
    .delete()
    .eq("promo_code_id", id);
  if (data.scope === "product" && productIds.length > 0) {
    await supabaseAdmin.from("promo_code_products").insert(
      productIds.map((pid) => ({
        promo_code_id: id,
        product_id: pid,
      })),
    );
  }

  await supabaseAdmin
    .from("promo_code_users")
    .delete()
    .eq("promo_code_id", id);
  if (userIds.length > 0) {
    await supabaseAdmin.from("promo_code_users").insert(
      userIds.map((uid) => ({
        promo_code_id: id,
        user_id: uid,
      })),
    );
  }

  return {};
}

export async function deletePromoCode(
  id: string,
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from("promo_codes")
    .delete()
    .eq("id", id);
  if (error) return { error: "Failed to delete promo code." };
  return {};
}

export async function recordPromoCodeRedemption(params: {
  promoCodeId: string;
  orderId: string;
  userId: string;
}): Promise<void> {
  await supabaseAdmin.from("promo_code_redemptions").insert({
    promo_code_id: params.promoCodeId,
    order_id: params.orderId,
    user_id: params.userId,
  });
}
