import { supabaseAdmin } from "@/lib/supabase.server";
import { getProductCosts } from "@/lib/inventoryDb";
import type { MixCompositionEntry } from "@/lib/orders";
import type {
  DashboardOrderStatus,
  ProfitClientData,
  ProfitClientOrder,
  ProfitClientRow,
} from "./profitTypes";

interface RawOrderItem {
  price: string | number;
  promo_discount: string | number | null;
  quantity: number;
  weight_g: number | null;
  mix_composition: MixCompositionEntry[] | null;
  order:
    | { updated_at: string; status: string }
    | { updated_at: string; status: string }[]
    | null;
  product_variants:
    | {
        product_id: string;
        products:
          | {
              id: string;
              title: string;
              image_url: string | null;
              status: string;
            }
          | {
              id: string;
              title: string;
              image_url: string | null;
              status: string;
            }[]
          | null;
      }
    | {
        product_id: string;
        products:
          | {
              id: string;
              title: string;
              image_url: string | null;
              status: string;
            }
          | {
              id: string;
              title: string;
              image_url: string | null;
              status: string;
            }[]
          | null;
      }[]
    | null;
}

interface RawOrder {
  status: string;
  updated_at: string;
  total: string | number;
}

const TRACKED_STATUSES: DashboardOrderStatus[] = [
  "PAID",
  "FAILED",
  "CANCELLED",
];

function pickFirst<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function isTrackedStatus(s: string): s is DashboardOrderStatus {
  return s === "PAID" || s === "FAILED" || s === "CANCELLED";
}

/**
 * Loads ALL paid order_items (for revenue/profit/top sellers) and all
 * PAID/FAILED/CANCELLED orders (for AOV + issue counts) in one round-trip.
 * The client filters by range and aggregates — switching periods is instant.
 */
export async function getProfitClientData(): Promise<ProfitClientData> {
  const [itemsResult, ordersResult] = await Promise.all([
    supabaseAdmin
      .from("order_items")
      .select(
        `price, promo_discount, quantity, weight_g, mix_composition,
         order:orders!inner(updated_at, status),
         product_variants:variant_id(
           product_id,
           products:product_id(id, title, image_url, status)
         )`,
      )
      .eq("order.status", "PAID"),
    supabaseAdmin
      .from("orders")
      .select("status, updated_at, total")
      .in("status", TRACKED_STATUSES),
  ]);

  if (itemsResult.error || !itemsResult.data) {
    return { rows: [], costs: {}, orders: [] };
  }

  const rawItems = itemsResult.data as unknown as RawOrderItem[];
  const rawOrders = (ordersResult.data ?? []) as unknown as RawOrder[];

  const rows: ProfitClientRow[] = [];
  const productIds = new Set<string>();

  for (const r of rawItems) {
    const order = pickFirst(r.order);
    if (!order) continue;
    const paidAt = new Date(order.updated_at).getTime();
    if (!Number.isFinite(paidAt)) continue;

    const promoDiscount = Number(r.promo_discount ?? 0);

    if (r.mix_composition && r.mix_composition.length > 0) {
      for (const entry of r.mix_composition) {
        if (entry.product_id) productIds.add(entry.product_id);
      }
      rows.push({
        paid_at: paidAt,
        price: Number(r.price),
        promo_discount: promoDiscount,
        quantity: r.quantity,
        product_id: null,
        weight_g: r.weight_g ?? 0,
        product_name: null,
        product_image_url: null,
        mix_composition: r.mix_composition,
      });
    } else {
      const variant = pickFirst(r.product_variants);
      const product = variant ? pickFirst(variant.products) : null;
      if (!product || product.status === "system") continue;
      productIds.add(product.id);
      rows.push({
        paid_at: paidAt,
        price: Number(r.price),
        promo_discount: promoDiscount,
        quantity: r.quantity,
        product_id: product.id,
        weight_g: r.weight_g ?? 0,
        product_name: product.title,
        product_image_url: product.image_url,
        mix_composition: null,
      });
    }
  }

  const orders: ProfitClientOrder[] = [];
  for (const o of rawOrders) {
    if (!isTrackedStatus(o.status)) continue;
    const ts = new Date(o.updated_at).getTime();
    if (!Number.isFinite(ts)) continue;
    orders.push({
      changed_at: ts,
      status: o.status,
      total: Number(o.total),
    });
  }

  const costMap = productIds.size
    ? await getProductCosts([...productIds])
    : new Map<string, number>();
  const costs: Record<string, number> = {};
  for (const [id, c] of costMap) costs[id] = c;

  return { rows, costs, orders };
}
