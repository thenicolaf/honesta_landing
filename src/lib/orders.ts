import { supabaseAdmin } from "@/lib/supabase.server";
import type { CartItem } from "@/sections/products/types/types";
import type { CustomerInfo } from "@/shared/types";
import { OrderStatus } from "@/shared/types";

interface OrderResult {
  id: string;
  total: number;
}

export async function createOrderWithItems(
  items: CartItem[],
  customer: Partial<CustomerInfo>,
  subtotal: number,
  deliveryFee: number,
  userId?: string,
): Promise<{ data: OrderResult | null; error: string | null }> {
  const total = subtotal + deliveryFee;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      status: OrderStatus.PENDING,
      subtotal,
      delivery_fee: deliveryFee,
      total,
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
      quantity: item.quantity,
      weight_g: item.weight_g,
    })),
  );

  return { data: { id: order.id, total }, error: null };
}
