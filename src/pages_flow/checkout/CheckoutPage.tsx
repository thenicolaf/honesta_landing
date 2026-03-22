"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useCart } from "@/providers";
import { submitCheckout } from "./actions";
import { CheckoutForm } from "./ui/CheckoutForm";
import { OrderSummary } from "./ui/OrderSummary";
import { CustomerInfo } from "@/shared/types";
import { EmptyCart } from "@/pages_flow/cart/EmptyCart";
import { Loader } from "@/shared/ui/Loader";
import { Button, toastError } from "@/shared/ui";
import { IconChevron } from "@/shared/icons";
import type { UserAddress } from "@/lib/addressesDb";
import type { DeliverySetting } from "@/lib/deliveryDb";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import { parseAddress } from "@/shared/utils/address";

interface CheckoutPageProps {
  defaultValues?: Partial<CustomerInfo>;
  addresses?: UserAddress[];
  deliverySettings: DeliverySetting[];
}

export function CheckoutPage({
  defaultValues,
  addresses,
  deliverySettings,
}: CheckoutPageProps) {
  const { items, total, isHydrated } = useCart();
  const [emirate, setEmirate] = useState(
    defaultValues?.address
      ? extractEmirateFromAddress(defaultValues.address, addresses)
      : "Dubai",
  );

  const delivery = calculateDelivery(total, emirate, deliverySettings);
  const disabledEmirates = deliverySettings
    .filter((s) => !s.is_active)
    .map((s) => s.emirate);

  const [state, formAction] = useActionState(
    submitCheckout.bind(null, items),
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
  }, [state]);

  if (!isHydrated) {
    return (
      <main className="grow min-h-160">
        <Loader />
      </main>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <Button href="/cart" variant="outline" size="sm" className="gap-1.5 mb-4">
          <IconChevron className="w-3.5 h-3.5 rotate-90" aria-hidden />
          Back to cart
        </Button>
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          Checkout
        </p>
        <h1
          className="font-display font-bold italic text-heading leading-tight text-center mb-10"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Your Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <form action={formAction} className="flex flex-col gap-5">
            <CheckoutForm
              defaultValues={defaultValues}
              addresses={addresses}
              fieldErrors={state?.fieldErrors}
              totalWithDelivery={total + delivery.fee}
              onEmirateChange={setEmirate}
              belowMinimum={delivery.belowMinimum}
              minimumOrder={delivery.minimumOrder}
              disabledEmirates={disabledEmirates}
            />
          </form>
          <OrderSummary
            deliveryFee={delivery.fee}
            isFreeDelivery={delivery.isFreeDelivery}
            deliveryDays={delivery.deliveryDays}
            originalFee={
              deliverySettings.find(
                (s) => s.emirate.toLowerCase() === emirate.toLowerCase(),
              )?.delivery_fee
            }
          />
        </div>
      </div>
    </main>
  );
}

function extractEmirateFromAddress(
  address: string,
  addresses?: UserAddress[],
): string {
  const defaultAddr = addresses?.find((a) => a.is_default) ?? addresses?.[0];
  const addrStr = defaultAddr?.address ?? address;
  const parsed = parseAddress(addrStr);
  return parsed.defaultEmirate || "Dubai";
}
