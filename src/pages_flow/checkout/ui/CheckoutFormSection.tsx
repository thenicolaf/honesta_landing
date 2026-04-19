"use client";

import { useActionState, useEffect, useRef } from "react";
import { useCart } from "@/providers";
import { submitCheckout } from "../actions";
import { CheckoutForm } from "./CheckoutForm";
import { toastError } from "@/shared/ui";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import type { CustomerInfo } from "@/shared/types";
import type { UserAddress } from "@/lib/addressesDb";
import type { DeliverySetting } from "@/lib/deliveryDb";

interface CheckoutFormSectionProps {
  defaultValues?: Partial<CustomerInfo>;
  addresses?: UserAddress[];
  deliverySettings: DeliverySetting[];
  isAuthenticated: boolean;
  emirate: string;
  onEmirateChange: (emirate: string) => void;
}

export function CheckoutFormSection({
  defaultValues,
  addresses,
  deliverySettings,
  isAuthenticated,
  emirate,
  onEmirateChange,
}: CheckoutFormSectionProps) {
  const { items, total, appliedPromoCode } = useCart();

  const delivery = calculateDelivery(total, emirate, deliverySettings);
  const disabledEmirates = deliverySettings
    .filter((s) => !s.is_active)
    .map((s) => s.emirate);
  const emirateWarning = disabledEmirates.includes(emirate)
    ? `Delivery to ${emirate} is currently unavailable. Please select another emirate.`
    : undefined;

  const [state, formAction] = useActionState(
    submitCheckout.bind(null, items, appliedPromoCode?.code ?? null),
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
    if (state?.promoCodeError) toastError(state.promoCodeError);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <CheckoutForm
        defaultValues={defaultValues}
        addresses={addresses}
        fieldErrors={state?.fieldErrors}
        promoCodeError={state?.promoCodeError}
        emirateWarning={emirateWarning}
        totalWithDelivery={total + delivery.fee}
        isAuthenticated={isAuthenticated}
        onEmirateChange={onEmirateChange}
        belowMinimum={delivery.belowMinimum}
        minimumOrder={delivery.minimumOrder}
        disabledEmirates={disabledEmirates}
      />
    </form>
  );
}
