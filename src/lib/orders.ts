import { supabaseAdmin } from "@/lib/supabase.server";
import { findMissingVariantIds } from "@/lib/validateOrderVariants";
import type { CartItem } from "@/sections/products/types/types";
import type { CustomerInfo } from "@/shared/types";
import { OrderStatus } from "@/shared/types";

export type MixCompositionEntry = {
  product_id: string;
  name: string;
  image_url: string | null;
  count: number;
  weight_g: number;
  price: number;
};

/** A row ready to be inserted into `order_items` — no further transformation. */
export interface OrderItemRow {
  variant_id: string | null;
  name: string;
  price: number;
  original_price: number | null;
  promo_discount: number;
  quantity: number;
  weight_g: number;
  mix_composition: MixCompositionEntry[] | null;
}

/**
 * Loads mix_composition snapshots from `mix_variant_cells` for the given variantIds.
 * Used by the cart → checkout flow where mix variants already exist in the DB.
 * Admin manual orders build their composition inline and do not call this.
 */
export async function buildMixCompositionMap(
  variantIds: string[],
): Promise<Map<string, MixCompositionEntry[]>> {
  const result = new Map<string, MixCompositionEntry[]>();
  if (variantIds.length === 0) return result;

  const { data: variants } = await supabaseAdmin
    .from("product_variants")
    .select("id, products!inner(status)")
    .in("id", variantIds)
    .eq("products.status", "system");

  const mixVariantIds = (variants ?? []).map((v) => v.id);
  if (mixVariantIds.length === 0) return result;

  const { data: cells } = await supabaseAdmin
    .from("mix_variant_cells")
    .select(
      "variant_id, preset_id, mix_box_presets:preset_id(weight_g, price, product:products(id, title, image_url))",
    )
    .in("variant_id", mixVariantIds);

  type CellProduct = { id: string; title: string; image_url: string | null };
  type CellRow = {
    variant_id: string;
    preset_id: string;
    mix_box_presets: {
      weight_g: number;
      price: string | number;
      product: CellProduct | CellProduct[] | null;
    };
  };

  for (const row of (cells ?? []) as unknown as CellRow[]) {
    const preset = row.mix_box_presets;
    const rawProduct = preset.product;
    const product = (
      Array.isArray(rawProduct) ? rawProduct[0] : rawProduct
    ) as CellProduct | null;

    if (!product) continue;

    const list = result.get(row.variant_id) ?? [];
    const existing = list.find((e) => e.product_id === product.id);
    if (existing) {
      existing.count++;
    } else {
      list.push({
        product_id: product.id,
        name: product.title,
        image_url: product.image_url,
        count: 1,
        weight_g: preset.weight_g,
        price: Number(preset.price),
      });
    }
    result.set(row.variant_id, list);
  }

  return result;
}

interface OrderResult {
  id: string;
  total: number;
}

interface CreateOrderParams {
  /** Pre-built rows ready for insert. Callers assemble these — no hidden DB lookups. */
  items: OrderItemRow[];
  customer: Partial<CustomerInfo>;
  subtotal: number;
  deliveryFee: number;
  userId?: string;
  promoCodeId?: string | null;
  promoDiscount?: number;
  promotionDiscount?: number;
  /** Defaults to OrderStatus.PENDING. Pass OrderStatus.PAID for manual admin orders. */
  status?: OrderStatus;
  /** Pre-formatted human-readable delivery summary. */
  deliverySchedule?: string | null;
}

/**
 * Converts a CartItem (cart/checkout flow) into an OrderItemRow using the authoritative
 * mix_composition snapshot from `mix_variant_cells` (via buildMixCompositionMap).
 * Admin manual orders build OrderItemRow directly with an inline mix_composition snapshot.
 */
export function cartItemToOrderRow(
  item: CartItem,
  mixCompositionMap: Map<string, MixCompositionEntry[]>,
  perItemPromoDiscounts?: Map<string, number>,
): OrderItemRow {
  return {
    variant_id: item.variantId,
    name: item.name,
    price: item.price,
    original_price: item.originalPrice ?? null,
    promo_discount: perItemPromoDiscounts?.get(item.variantId) ?? 0,
    quantity: item.quantity,
    weight_g: item.weight_g,
    mix_composition: mixCompositionMap.get(item.variantId) ?? null,
  };
}

export async function createOrderWithItems({
  items,
  customer,
  subtotal,
  deliveryFee,
  userId,
  promoCodeId = null,
  promoDiscount = 0,
  promotionDiscount = 0,
  status = OrderStatus.PENDING,
  deliverySchedule = null,
}: CreateOrderParams): Promise<{
  data: OrderResult | null;
  error: string | null;
}> {
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const total = discountedSubtotal + deliveryFee;

  const variantIds = items
    .map((row) => row.variant_id)
    .filter((id): id is string => id !== null);
  const missingVariantIds = await findMissingVariantIds(variantIds);
  if (missingVariantIds.length > 0) {
    return {
      data: null,
      error:
        "Some items in your cart are no longer available. Please refresh the page and try again.",
    };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      status,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      promo_code_id: promoCodeId,
      promo_discount: promoDiscount,
      promotion_discount: promotionDiscount,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes ?? null,
      coordinates:
        customer.lat && customer.lng
          ? { lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) }
          : null,
      user_id: userId ?? null,
      delivery_schedule: deliverySchedule,
    })
    .select()
    .single();

  if (orderError) return { data: null, error: orderError.message };

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(items.map((row) => ({ ...row, order_id: order.id })));

  if (itemsError) {
    console.error("order_items insert failed:", itemsError);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return {
      data: null,
      error: `Failed to save order items: ${itemsError.message}`,
    };
  }

  return { data: { id: order.id, total }, error: null };
}
