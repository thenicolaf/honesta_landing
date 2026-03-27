"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { CartItem } from "@/sections/products/types/types";
import { CUSTOMER_COOKIE_KEY, COOKIE_CONSENT_KEY } from "@/shared/consts";
import type { CustomerInfo } from "@/shared/types";
import {
  validateCustomer,
  type CustomerErrors,
} from "@/shared/utils/validateCustomer";
import { createOrderWithItems } from "@/lib/orders";
import { createPaymentForOrder } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { createNotification } from "@/lib/notificationsDb";
import { getDeliverySettingByEmirate } from "@/lib/deliveryDb";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";

export interface CheckoutState {
  error?: string;
  fieldErrors?: CustomerErrors;
  values?: Partial<CustomerInfo>;
}

export async function submitCheckout(
  items: CartItem[],
  _prevState: CheckoutState | null,
  formData: FormData,
): Promise<CheckoutState | null> {
  const customer = Object.fromEntries(formData) as Partial<CustomerInfo>;

  console.log("[submitCheckout] formData entries:", Object.fromEntries(formData));

  const cookieStore = await cookies();

  // 1. Check auth — authorized users' data comes from DB, not cookies
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Persist customer info for next visit (skip if guest declined cookies)
  const consent = cookieStore.get(COOKIE_CONSENT_KEY)?.value;
  if (user || consent !== "declined") {
    cookieStore.set(CUSTOMER_COOKIE_KEY, JSON.stringify(customer), {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  const fieldErrors = validateCustomer(customer);
  if (fieldErrors) {
    console.log("[submitCheckout] validation errors:", fieldErrors);
    return { fieldErrors, values: customer };
  }

  // 2. Calculate delivery fee server-side (authoritative)
  const emirate = (formData.get("emirate") as string)?.trim() || "Dubai";
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const setting = await getDeliverySettingByEmirate(emirate);

  if (setting && !setting.is_active) {
    return {
      fieldErrors: {
        emirate: `Delivery to ${emirate} is currently unavailable`,
      },
      values: customer,
    };
  }

  const delivery = calculateDelivery(
    subtotal,
    emirate,
    setting ? [setting] : [],
  );

  if (delivery.belowMinimum) {
    return {
      fieldErrors: {
        emirate: `Minimum order of AED ${delivery.minimumOrder} is required for ${emirate}`,
      },
      values: customer,
    };
  }

  const { data: order, error: orderError } = await createOrderWithItems(
    items,
    customer,
    subtotal,
    delivery.fee,
    user?.id,
  );
  if (orderError || !order) {
    return { error: orderError ?? "Failed to create order", values: customer };
  }

  // Notify admin
  await createNotification({
    type: "new_order",
    title: "New order",
    message: `${customer.firstName} ${customer.lastName} — AED ${order.total}`,
    relatedId: order.id,
  });

  // 3. Create payment
  const { paymentUrl, error: paymentError } = await createPaymentForOrder(
    order.id,
    order.total,
    customer,
    emirate,
  );
  if (paymentError || !paymentUrl) {
    return { error: paymentError ?? "Failed to create payment", values: customer };
  }

  redirect(paymentUrl);
}
