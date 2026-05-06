import { cookies } from "next/headers";
import type { CartItem } from "@/sections/products/types/types";
import {
  CUSTOMER_COOKIE_KEY,
  COOKIE_CONSENT_KEY,
  DEFAULT_EMIRATE,
} from "@/shared/consts";
import type { CustomerInfo } from "@/shared/types";
import {
  validateCustomer,
  type CustomerErrors,
} from "@/shared/utils/validateCustomer";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { getDeliverySettingByEmirate, type DeliverySetting } from "@/lib/deliveryDb";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import {
  validatePromoCode,
  type AppliedPromoCode,
} from "@/lib/promoCodeApply";
import { getCartTotals } from "@/lib/cart";
import { getPerItemPromoDiscounts } from "@/shared/utils/recalculatePromoDiscount";
import {
  getActiveDeliverySlots,
  getAvailableSlotsForDate,
  type DeliverySlot,
} from "@/lib/deliverySlotsDb";
import { getDeliveryBlackouts } from "@/lib/deliveryBlackoutsDb";
import {
  formatDeliverySchedule,
  fromDateOnlyString,
} from "@/shared/utils/zonedTime";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CurrentUser {
  id: string | null;
}

export interface DeliveryFormFields {
  deliveryDate: string;
  deliverySlotId: string;
}

export interface PromoCodeOutcome {
  promoCodeId: string | null;
  promoDiscount: number;
  appliedCode: AppliedPromoCode | null;
}

export interface ValidatedDeliveryWindow {
  deliverySchedule: string | null;
  chosenSlot: DeliverySlot | null;
}

export type StepFailure = {
  ok: false;
  error?: string;
  fieldErrors?: CustomerErrors;
  promoCodeError?: string;
};

export type StepSuccess<T> = { ok: true; value: T };
export type StepResult<T> = StepSuccess<T> | StepFailure;

const fail = (failure: Omit<StepFailure, "ok">): StepFailure => ({
  ok: false,
  ...failure,
});

const succeed = <T>(value: T): StepSuccess<T> => ({ ok: true, value });

// ─── 1. Auth + cookie persistence ────────────────────────────────────────────

export async function loadCurrentUser(): Promise<CurrentUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { id: user?.id ?? null };
}

export async function persistCustomerCookie(
  customer: Partial<CustomerInfo>,
  isAuthenticated: boolean,
): Promise<void> {
  const cookieStore = await cookies();
  const consent = cookieStore.get(COOKIE_CONSENT_KEY)?.value;
  if (!isAuthenticated && consent === "declined") return;
  cookieStore.set(CUSTOMER_COOKIE_KEY, JSON.stringify(customer), {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

// ─── 2. Field-level validation (customer + delivery date/slot) ──────────────

export function parseDeliveryFields(formData: FormData): DeliveryFormFields {
  return {
    deliveryDate: ((formData.get("delivery_date") as string) ?? "").trim(),
    deliverySlotId: ((formData.get("delivery_slot_id") as string) ?? "").trim(),
  };
}

export function validateCheckoutFields(
  customer: Partial<CustomerInfo>,
  delivery: DeliveryFormFields,
  scheduleRequired: boolean,
): CustomerErrors | null {
  const fieldErrors: CustomerErrors = { ...(validateCustomer(customer) ?? {}) };
  if (scheduleRequired) {
    if (!delivery.deliveryDate)
      fieldErrors.deliveryDate = "Pick a delivery date";
    if (!delivery.deliverySlotId)
      fieldErrors.deliverySlot = "Pick a delivery slot";
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

// ─── 3. Promo code re-validation ────────────────────────────────────────────

export async function applyPromoCode(
  code: string | null,
  items: CartItem[],
  userId: string | null,
): Promise<StepResult<PromoCodeOutcome>> {
  if (!code) {
    return succeed({ promoCodeId: null, promoDiscount: 0, appliedCode: null });
  }
  const result = await validatePromoCode({ code, items, userId });
  if (!result.ok) return fail({ promoCodeError: result.error });
  return succeed({
    promoCodeId: result.appliedCode.id,
    promoDiscount: result.appliedCode.discount,
    appliedCode: result.appliedCode,
  });
}

export function readSubmittedPromoCode(
  promoCodeProp: string | null,
  formData: FormData,
): string | null {
  return promoCodeProp ?? ((formData.get("promo_code") as string | null) ?? null);
}

// ─── 4. Delivery fee calculation + emirate gate ─────────────────────────────

export interface DeliveryFeeOutcome {
  setting: DeliverySetting | null;
  emirate: string;
  fee: number;
}

export function readEmirate(formData: FormData): string {
  return (formData.get("emirate") as string)?.trim() || DEFAULT_EMIRATE;
}

export async function fetchDeliverySetting(
  emirate: string,
): Promise<DeliverySetting | null> {
  return getDeliverySettingByEmirate(emirate);
}

/**
 * Pure synchronous gate — assumes the setting was already fetched. Splitting
 * the fetch from the calculation lets submitCheckout parallelise DB calls.
 */
export function evaluateDeliveryFee(
  emirate: string,
  setting: DeliverySetting | null,
  discountedSubtotal: number,
): StepResult<DeliveryFeeOutcome> {
  if (setting && !setting.is_active) {
    return fail({
      fieldErrors: {
        emirate: `Delivery to ${emirate} is currently unavailable`,
      },
    });
  }

  const delivery = calculateDelivery(
    discountedSubtotal,
    emirate,
    setting ? [setting] : [],
  );

  if (delivery.belowMinimum) {
    return fail({
      fieldErrors: {
        emirate: `Minimum order of AED ${delivery.minimumOrder} is required for ${emirate}`,
      },
    });
  }

  return succeed({ setting, emirate, fee: delivery.fee });
}

// ─── 5. Delivery window re-validation ────────────────────────────────────────

export async function revalidateDeliveryWindow(
  delivery: DeliveryFormFields,
  cutoffHour: number,
  deliveryDays: number,
): Promise<StepResult<ValidatedDeliveryWindow>> {
  const [allSlots, blackouts] = await Promise.all([
    getActiveDeliverySlots(),
    getDeliveryBlackouts(),
  ]);

  // Admin hasn't configured any active slots — accept the order without a
  // schedule (matches the client-side "scheduleRequired = slots.length > 0").
  if (allSlots.length === 0) {
    return succeed({ deliverySchedule: null, chosenSlot: null });
  }

  const date = fromDateOnlyString(delivery.deliveryDate);
  const availableSlots = getAvailableSlotsForDate(
    date,
    allSlots,
    blackouts,
    cutoffHour,
    deliveryDays,
  );
  if (availableSlots.length === 0) {
    return fail({
      fieldErrors: {
        deliveryDate: "This date is no longer available, pick another one",
      },
    });
  }
  const chosenSlot = availableSlots.find((s) => s.id === delivery.deliverySlotId);
  if (!chosenSlot) {
    return fail({
      fieldErrors: { deliverySlot: "This slot is no longer available" },
    });
  }
  return succeed({
    deliverySchedule: formatDeliverySchedule(date, chosenSlot),
    chosenSlot,
  });
}

// ─── Cart totals helper ─────────────────────────────────────────────────────

export interface CheckoutTotals {
  subtotal: number;
  promotionDiscount: number;
  discountedSubtotal: number;
  perItemPromoDiscounts: Map<string, number>;
}

export function computeCheckoutTotals(
  items: CartItem[],
  appliedCode: AppliedPromoCode | null,
  promoDiscount: number,
): CheckoutTotals {
  const totals = getCartTotals(items, promoDiscount);
  return {
    subtotal: totals.subtotal,
    promotionDiscount: totals.promotionDiscount,
    discountedSubtotal: totals.total,
    perItemPromoDiscounts: getPerItemPromoDiscounts(items, appliedCode),
  };
}
