import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import { getPromoCodes, type PromoCodeListItem } from "@/lib/promoCodesDb";
import { getPromoCodeStatus } from "@/pages_flow/panel/promo-codes/types";

export const getDashboardOrders = cache(async () => {
  const { data } = await supabaseAdmin
    .from("orders")
    .select(
      "created_at, status, total, delivery_fee, order_items(name, price, quantity, weight_g, mix_composition)",
    );
  return data ?? [];
});

export const getProductStats = cache(async () => {
  const { data } = await supabaseAdmin
    .from("products")
    .select("status, in_stock, mark");
  return data ?? [];
});

export const getCategoriesCount = cache(async () => {
  const { count } = await supabaseAdmin
    .from("categories")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
});

export const getPartnershipsCount = cache(async () => {
  const { count } = await supabaseAdmin
    .from("partnership_inquiries")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
});

export const getUsersCount = cache(async () => {
  const { count } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
});

export const getActivePromotions = cache(async () => {
  const { data } = await supabaseAdmin
    .from("promotions")
    .select("id, name, discount_type, discount_value, ends_at, promotion_products(product_id)")
    .eq("is_active", true)
    .gte("ends_at", new Date().toISOString());
  return data ?? [];
});

export const getOnPromotionProductsCount = cache(async () => {
  const { data } = await supabaseAdmin
    .from("promotion_products")
    .select("product_id, promotions!inner(is_active, ends_at)")
    .eq("promotions.is_active", true)
    .gte("promotions.ends_at", new Date().toISOString());

  const ids = new Set<string>();
  for (const row of (data ?? []) as { product_id: string }[]) {
    ids.add(row.product_id);
  }
  return ids.size;
});

export type DashboardPromoCode = PromoCodeListItem & {
  status: "active" | "scheduled";
  product_count: number;
  user_count: number;
};

export const getActivePromoCodesForDashboard = cache(
  async (): Promise<DashboardPromoCode[]> => {
    const codes = await getPromoCodes();
    if (codes.length === 0) return [];

    const filtered: Array<{ code: PromoCodeListItem; status: "active" | "scheduled" }> = [];
    for (const c of codes) {
      const status = getPromoCodeStatus(
        c.is_active,
        c.starts_at,
        c.ends_at,
        c.used_count,
        c.max_uses,
      );
      if (status === "active" || status === "scheduled") {
        filtered.push({ code: c, status });
      }
    }
    if (filtered.length === 0) return [];

    const ids = filtered.map(({ code }) => code.id);

    const [{ data: products }, { data: users }] = await Promise.all([
      supabaseAdmin
        .from("promo_code_products")
        .select("promo_code_id")
        .in("promo_code_id", ids),
      supabaseAdmin
        .from("promo_code_users")
        .select("promo_code_id")
        .in("promo_code_id", ids),
    ]);

    const productCounts = new Map<string, number>();
    for (const row of (products ?? []) as { promo_code_id: string }[]) {
      productCounts.set(row.promo_code_id, (productCounts.get(row.promo_code_id) ?? 0) + 1);
    }
    const userCounts = new Map<string, number>();
    for (const row of (users ?? []) as { promo_code_id: string }[]) {
      userCounts.set(row.promo_code_id, (userCounts.get(row.promo_code_id) ?? 0) + 1);
    }

    return filtered.map(({ code, status }) => ({
      ...code,
      status,
      product_count: productCounts.get(code.id) ?? 0,
      user_count: userCounts.get(code.id) ?? 0,
    }));
  },
);
