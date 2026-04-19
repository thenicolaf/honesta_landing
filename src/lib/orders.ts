import { supabaseAdmin } from "@/lib/supabase.server";
import type { CartItem } from "@/sections/products/types/types";
import type { CustomerInfo } from "@/shared/types";
import { OrderStatus } from "@/shared/types";

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

  await supabaseAdmin.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      name: item.name,
      price: item.price,
      original_price: item.originalPrice ?? null,
      promo_discount: perItemPromoDiscounts?.get(item.variantId) ?? 0,
      quantity: item.quantity,
      weight_g: item.weight_g,
      mix_composition: item.isMix && item.mixItems ? item.mixItems : null,
    })),
  );

  return { data: { id: order.id, total }, error: null };
}
