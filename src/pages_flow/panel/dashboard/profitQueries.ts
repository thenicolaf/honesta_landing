import { supabaseAdmin } from "@/lib/supabase.server";
import { getProductCosts } from "@/lib/inventoryDb";
import type { MixCompositionEntry } from "@/lib/orders";
import type { ProfitClientData, ProfitClientRow } from "./profitTypes";

interface RawOrderItem {
  price: string | number;
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

function pickFirst<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Loads ALL paid order_items at once + a batch cost map. The client filters by
 * range and aggregates — switching periods is instant, no extra queries.
 */
export async function getProfitClientData(): Promise<ProfitClientData> {
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select(
      `price, quantity, weight_g, mix_composition,
       order:orders!inner(updated_at, status),
       product_variants:variant_id(
         product_id,
         products:product_id(id, title, image_url, status)
       )`,
    )
    .eq("order.status", "PAID");

  if (error || !data) return { rows: [], costs: {} };

  const raw = data as unknown as RawOrderItem[];

  const rows: ProfitClientRow[] = [];
  const productIds = new Set<string>();

  for (const r of raw) {
    const order = pickFirst(r.order);
    if (!order) continue;
    const paidAt = new Date(order.updated_at).getTime();
    if (!Number.isFinite(paidAt)) continue;

    if (r.mix_composition && r.mix_composition.length > 0) {
      for (const entry of r.mix_composition) {
        if (entry.product_id) productIds.add(entry.product_id);
      }
      rows.push({
        paid_at: paidAt,
        price: Number(r.price),
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
        quantity: r.quantity,
        product_id: product.id,
        weight_g: r.weight_g ?? 0,
        product_name: product.title,
        product_image_url: product.image_url,
        mix_composition: null,
      });
    }
  }

  const costMap = productIds.size
    ? await getProductCosts([...productIds])
    : new Map<string, number>();
  const costs: Record<string, number> = {};
  for (const [id, c] of costMap) costs[id] = c;

  return { rows, costs };
}
