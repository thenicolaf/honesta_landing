"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useCart } from "@/providers";
import { submitCheckout } from "../actions";
import { CheckoutForm } from "./CheckoutForm";
import { DeliveryScheduleSection } from "./DeliveryScheduleSection";
import { toastError } from "@/shared/ui";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import type { CustomerInfo } from "@/shared/types";
import type { UserAddress } from "@/lib/addressesDb";
import type { DeliverySetting } from "@/lib/deliveryDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";

interface CheckoutFormSectionProps {
  defaultValues?: Partial<CustomerInfo>;
  addresses?: UserAddress[];
  deliverySettings: DeliverySetting[];
  deliverySlots: DeliverySlot[];
  deliveryBlackouts: DeliveryBlackout[];
  isAuthenticated: boolean;
  emirate: string;
  onEmirateChange: (emirate: string) => void;
}

export function CheckoutFormSection({
  defaultValues,
  addresses,
  deliverySettings,
  deliverySlots,
  deliveryBlackouts,
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

  const emirateSetting = deliverySettings.find(
    (s) => s.emirate.toLowerCase() === emirate.toLowerCase(),
  );
  const cutoffHour = emirateSetting?.cutoff_hour ?? 19;
  const deliveryDays = emirateSetting?.delivery_days ?? 1;

  const scheduleRequired = deliverySlots.length > 0;
  const [scheduleSelected, setScheduleSelected] = useState(false);

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

  const mergedDefaults = state?.values
    ? { ...defaultValues, ...state.values }
    : defaultValues;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <CheckoutForm
        defaultValues={mergedDefaults}
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
        scheduleRequired={scheduleRequired}
        scheduleSelected={scheduleSelected}
        scheduleSlot={
          <DeliveryScheduleSection
            slots={deliverySlots}
            blackouts={deliveryBlackouts}
            cutoffHour={cutoffHour}
            deliveryDays={deliveryDays}
            fieldErrors={{
              deliveryDate: state?.fieldErrors?.deliveryDate,
              deliverySlot: state?.fieldErrors?.deliverySlot,
            }}
            onSelectionChange={setScheduleSelected}
          />
        }
      />
    </form>
  );
}
