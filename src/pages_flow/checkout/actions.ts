"use server";

import { redirect } from "next/navigation";
import type { CartItem } from "@/sections/products/types/types";
import type { CustomerInfo } from "@/shared/types";
import type { CustomerErrors } from "@/shared/utils/validateCustomer";
import {
  buildMixCompositionMap,
  cartItemToOrderRow,
  createOrderWithItems,
} from "@/lib/orders";
import { createPaymentForOrder } from "@/lib/payments";
import { getActiveDeliverySlots } from "@/lib/deliverySlotsDb";
import {
  applyPromoCode,
  computeCheckoutTotals,
  evaluateDeliveryFee,
  fetchDeliverySetting,
  loadCurrentUser,
  parseDeliveryFields,
  persistCustomerCookie,
  readEmirate,
  readSubmittedPromoCode,
  revalidateDeliveryWindow,
  validateCheckoutFields,
} from "./checkoutSteps";

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

  try {
    // Phase 1 — fan out independent reads in parallel:
    //   user (auth), active slots, emirate setting, mix composition snapshots.
    // None of them depend on each other, so we don't pay for sequential RTTs.
    const emirate = readEmirate(formData);
    const deliveryFields = parseDeliveryFields(formData);
    const submittedPromo = readSubmittedPromoCode(promoCode, formData);

    const [user, activeSlots, setting, mixCompositionMap] = await Promise.all([
      loadCurrentUser(),
      getActiveDeliverySlots(),
      fetchDeliverySetting(emirate),
      buildMixCompositionMap(items.map((i) => i.variantId)),
    ]);

    // Best-effort cookie write — don't await DB-bound work on it.
    void persistCustomerCookie(customer, user.id !== null);

    // Phase 2 — pure validation. Schedule fields are required only when admin
    // configured at least one active slot.
    const scheduleRequired = activeSlots.length > 0;
    const fieldErrors = validateCheckoutFields(
      customer,
      deliveryFields,
      scheduleRequired,
    );
    if (fieldErrors) return { fieldErrors, values: customer };

    // Phase 3 — promo + delivery window in parallel. Both depend only on data
    // we already have (or fetch independently).
    const [promo, window] = await Promise.all([
      applyPromoCode(submittedPromo, items, user.id),
      revalidateDeliveryWindow(
        deliveryFields,
        setting?.cutoff_hour ?? 19,
        setting?.delivery_days ?? 1,
      ),
    ]);
    if (!promo.ok)
      return { promoCodeError: promo.promoCodeError, values: customer };
    if (!window.ok)
      return { fieldErrors: window.fieldErrors, values: customer };

    // Phase 4 — pure totals + fee gate using already-fetched setting.
    const totals = computeCheckoutTotals(
      items,
      promo.value.appliedCode,
      promo.value.promoDiscount,
    );
    const deliveryFee = evaluateDeliveryFee(
      emirate,
      setting,
      totals.discountedSubtotal,
    );
    if (!deliveryFee.ok)
      return { fieldErrors: deliveryFee.fieldErrors, values: customer };

    // Phase 5 — build rows + persist order.
    const orderRows = items.map((i) =>
      cartItemToOrderRow(i, mixCompositionMap, totals.perItemPromoDiscounts),
    );
    const { data: order, error: orderError } = await createOrderWithItems({
      items: orderRows,
      customer,
      subtotal: totals.subtotal,
      deliveryFee: deliveryFee.value.fee,
      userId: user.id ?? undefined,
      promoCodeId: promo.value.promoCodeId,
      promoDiscount: promo.value.promoDiscount,
      promotionDiscount: totals.promotionDiscount,
      deliverySchedule: window.value.deliverySchedule,
    });
    if (orderError || !order) {
      return {
        error: orderError ?? "Failed to create order",
        values: customer,
      };
    }

    // Phase 6 — N-Genius hosted page (external network call, dominant latency).
    const { paymentUrl, error: paymentError } = await createPaymentForOrder(
      order.id,
      order.total,
      customer,
      deliveryFee.value.emirate,
    );
    if (paymentError || !paymentUrl) {
      return {
        error: paymentError ?? "Failed to create payment",
        values: customer,
      };
    }

    redirect(paymentUrl);
  } catch (err) {
    // redirect() throws a special Next.js error — rethrow it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Checkout error:", err);
    return {
      error: "Something went wrong. Please try again.",
      values: customer,
    };
  }
}
