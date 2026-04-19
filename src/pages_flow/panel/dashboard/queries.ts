import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";

export const getDashboardOrders = cache(async () => {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("status, total, delivery_fee, order_items(name, price, quantity)");
  return data ?? [];
});

export const getProductStats = cache(async () => {
  const { data } = await supabaseAdmin
    .from("products")
    .select("status, in_stock");
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
