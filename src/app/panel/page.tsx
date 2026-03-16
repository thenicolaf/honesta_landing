import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { DashboardPage } from "@/pages_flow/panel/dashboard/DashboardPage";
import type { DashboardStats, ProductSales } from "@/pages_flow/panel/dashboard/types";

export default async function PanelPage() {
  const [ordersRes, productsRes, categoriesRes, partnershipsRes, profilesRes, promotionsRes] =
    await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("status, total, delivery_fee, order_items(name, price, quantity)"),
      supabaseAdmin.from("products").select("status, in_stock"),
      supabaseAdmin
        .from("categories")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("partnership_inquiries")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("promotions")
        .select("id, name, discount_type, discount_value, ends_at, promotion_products(product_id)")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString()),
    ]);

  // ── Orders aggregation ──────────────────────────────────────────────────
  const orders = ordersRes.data ?? [];
  const byStatus: Record<string, number> = {};
  let revenue = 0;
  let paidCount = 0;
  let totalDelivery = 0;
  const salesMap = new Map<string, { quantity: number; revenue: number }>();

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

    if (o.status === OrderStatus.PAID) {
      revenue += Number(o.total);
      paidCount += 1;
      totalDelivery += Number(o.delivery_fee);

      for (const item of o.order_items) {
        const existing = salesMap.get(item.name);
        const itemRevenue = Number(item.price) * item.quantity;
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += itemRevenue;
        } else {
          salesMap.set(item.name, { quantity: item.quantity, revenue: itemRevenue });
        }
      }
    }
  }

  const productSales: ProductSales[] = Array.from(salesMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Products aggregation ────────────────────────────────────────────────
  const products = productsRes.data ?? [];
  let published = 0;
  let draft = 0;
  let archived = 0;
  let outOfStock = 0;

  for (const p of products) {
    if (p.status === "published") published++;
    else if (p.status === "draft") draft++;
    else if (p.status === "archived") archived++;
    if (p.in_stock === false) outOfStock++;
  }

  // ── Build stats ─────────────────────────────────────────────────────────
  const stats: DashboardStats = {
    orders: {
      total: orders.length,
      revenue,
      avgOrderValue: paidCount > 0 ? revenue / paidCount : 0,
      totalDelivery,
      byStatus,
      productSales,
    },
    products: {
      total: products.length,
      published,
      draft,
      archived,
      outOfStock,
    },
    categories: {
      total: categoriesRes.count ?? 0,
    },
    partnerships: {
      total: partnershipsRes.count ?? 0,
    },
    users: {
      total: profilesRes.count ?? 0,
    },
    activePromotions: (promotionsRes.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      discount_type: p.discount_type,
      discount_value: Number(p.discount_value),
      ends_at: p.ends_at,
      product_count: (p.promotion_products as { product_id: string }[])?.length ?? 0,
    })),
  };

  return <DashboardPage stats={stats} />;
}
