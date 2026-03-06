import { supabaseAdmin } from "@/lib/supabase.server";
import { createOrder as createNGeniusOrder } from "@/lib/ngenius";
import type { CustomerInfo } from "@/shared/types";

export async function createPaymentForOrder(
  orderId: string,
  totalInAed: number,
  customer: Partial<CustomerInfo>,
): Promise<{ paymentUrl: string | null; error: string | null }> {
  try {
    const ngeniusOrder = await createNGeniusOrder({
      amount: Math.round(totalInAed * 100),
      reference: orderId,
      emailAddress: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      address1: customer.address,
    });

    await supabaseAdmin
      .from("orders")
      .update({
        ngenius_ref: ngeniusOrder.orderRef,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return { paymentUrl: ngeniusOrder.paymentUrl, error: null };
  } catch (err) {
    return {
      paymentUrl: null,
      error: err instanceof Error ? err.message : "Failed to create payment",
    };
  }
}
