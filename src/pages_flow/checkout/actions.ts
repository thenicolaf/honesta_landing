"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { CartItem } from "@/sections/products/types/types";
import { CUSTOMER_COOKIE_KEY, DELIVERY_FEE } from "@/shared/consts";
import type { CustomerInfo } from "@/shared/types";
import {
  validateCustomer,
  type CustomerErrors,
} from "@/shared/utils/validateCustomer";
import { createOrderWithItems } from "@/lib/orders";
import { createPaymentForOrder } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export interface CheckoutState {
  error?: string;
  fieldErrors?: CustomerErrors;
}

export async function submitCheckout(
  items: CartItem[],
  _prevState: CheckoutState | null,
  formData: FormData,
): Promise<CheckoutState | null> {
  const customer = Object.fromEntries(formData) as Partial<CustomerInfo>;

  // Persist customer info for next visit
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_KEY, JSON.stringify(customer), {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  const fieldErrors = validateCustomer(customer);
  if (fieldErrors) {
    return { fieldErrors };
  }

  // 1. Create order
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { data: order, error: orderError } = await createOrderWithItems(
    items,
    customer,
    subtotal,
    DELIVERY_FEE,
    user?.id,
  );
  if (orderError || !order) {
    return { error: orderError ?? "Failed to create order" };
  }

  // 2. Create payment
  const { paymentUrl, error: paymentError } = await createPaymentForOrder(
    order.id,
    order.total,
    customer,
  );
  if (paymentError || !paymentUrl) {
    return { error: paymentError ?? "Failed to create payment" };
  }

  redirect(paymentUrl);
}
