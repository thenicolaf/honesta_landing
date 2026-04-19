import { supabaseAdmin } from "@/lib/supabase.server";
import type { CartItem } from "@/sections/products/types/types";
import type { CustomerInfo } from "@/shared/types";
import { OrderStatus } from "@/shared/types";

export type MixCompositionEntry = {
  name: string;
  image_url: string | null;
  count: number;
  weight_g: number;
  price: number;
};

async function buildMixCompositionMap(
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
      "variant_id, preset_id, mix_box_presets:preset_id(weight_g, price, product:products(title, image_url))",
    )
    .in("variant_id", mixVariantIds);

  type CellRow = {
    variant_id: string;
    preset_id: string;
    mix_box_presets: {
      weight_g: number;
      price: string | number;
      product: { title: string; image_url: string | null } | { title: string; image_url: string | null }[] | null;
    };
  };

  for (const row of (cells ?? []) as unknown as CellRow[]) {
    const preset = row.mix_box_presets;
    const rawProduct = preset.product as unknown;
    const product = (
      Array.isArray(rawProduct) ? rawProduct[0] : rawProduct
    ) as { title: string; image_url: string | null } | null;

    const list = result.get(row.variant_id) ?? [];
    const existing = list.find((e) => e.name === (product?.title ?? "—"));
    if (existing) {
      existing.count++;
    } else {
      list.push({
        name: product?.title ?? "—",
        image_url: product?.image_url ?? null,
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
  items: CartItem[];
  customer: Partial<CustomerInfo>;
  subtotal: number;
  deliveryFee: number;
  userId?: string;
  promoCodeId?: string | null;
  promoDiscount?: number;
  promotionDiscount?: number;
  /** Map of variantId → per-unit promo code discount (0 for ineligible) */
  perItemPromoDiscounts?: Map<string, number>;
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
  perItemPromoDiscounts,
}: CreateOrderParams): Promise<{
  data: OrderResult | null;
  error: string | null;
}> {
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const total = discountedSubtotal + deliveryFee;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      status: OrderStatus.PENDING,
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
    })
    .select()
    .single();

  if (orderError) return { data: null, error: orderError.message };

  // Build mix_composition snapshot authoritatively from DB (not from client state)
  const variantIds = items.map((i) => i.variantId);
  const mixCompositionMap = await buildMixCompositionMap(variantIds);

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      name: item.name,
      price: item.price,
      original_price: item.originalPrice ?? null,
      promo_discount: perItemPromoDiscounts?.get(item.variantId) ?? 0,
      quantity: item.quantity,
      weight_g: item.weight_g,
      mix_composition: mixCompositionMap.get(item.variantId) ?? null,
    })),
  );

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
