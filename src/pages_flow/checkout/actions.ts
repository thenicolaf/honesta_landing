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
import { validatePromoCode } from "@/lib/promoCodeApply";
import { getCartTotals } from "@/lib/cart";
import { getPerItemPromoDiscounts } from "@/shared/utils/recalculatePromoDiscount";
import type { AppliedPromoCode } from "@/lib/promoCodeApply";

export interface CheckoutState {
  error?: string;
  fieldErrors?: CustomerErrors;
  promoCodeError?: string;
  values?: Partial<CustomerInfo>;
}

export async function submitCheckout(
  items: CartItem[],
  promoCode: string | null,
  _prevState: CheckoutState | null,
  formData: FormData,
): Promise<CheckoutState | null> {
  const customer = Object.fromEntries(formData) as Partial<CustomerInfo>;

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
    return { fieldErrors, values: customer };
  }

  // 2. Calculate delivery fee server-side (authoritative)
  const emirate = (formData.get("emirate") as string)?.trim() || "Dubai";

  // 3. Validate and apply promo code (if present). Re-runs all checks
  // server-side using the actual user, items, and current DB state.
  let promoCodeId: string | null = null;
  let promoDiscount = 0;
  let appliedCode: AppliedPromoCode | null = null;
  const submittedPromo =
    promoCode ?? ((formData.get("promo_code") as string | null) ?? null);
  if (submittedPromo) {
    const result = await validatePromoCode({
      code: submittedPromo,
      items,
      userId: user?.id ?? null,
    });
    if (!result.ok) {
      return { promoCodeError: result.error, values: customer };
    }
    promoCodeId = result.appliedCode.id;
    promoDiscount = result.appliedCode.discount;
    appliedCode = result.appliedCode;
  }

  const perItemPromoDiscounts = getPerItemPromoDiscounts(items, appliedCode);

  const totals = getCartTotals(items, promoDiscount);
  const subtotal = totals.subtotal;
  const promotionDiscount = totals.promotionDiscount;
  const discountedSubtotal = totals.total;

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
    discountedSubtotal,
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

  const { data: order, error: orderError } = await createOrderWithItems({
    items,
    customer,
    subtotal,
    deliveryFee: delivery.fee,
    userId: user?.id,
    promoCodeId,
    promoDiscount,
    promotionDiscount,
    perItemPromoDiscounts,
  });
  if (orderError || !order) {
    return { error: orderError ?? "Failed to create order", values: customer };
  }

  // Notify admin
  await createNotification({
    type: "new_order",
    title: "New order",
    message: `${customer.firstName} ${customer.lastName} — AED ${Number(order.total).toFixed(2)}`,
    relatedId: order.id,
  });

  // 4. Create payment
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
