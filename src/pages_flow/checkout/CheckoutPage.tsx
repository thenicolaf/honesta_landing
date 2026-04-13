"use client";

import { useState } from "react";
import { useCart } from "@/providers";
import { CheckoutFormSection } from "./ui/CheckoutFormSection";
import { OrderSummary } from "./ui/OrderSummary";
import { EmptyCart } from "@/pages_flow/cart/EmptyCart";
import { Loader } from "@/shared/ui/Loader";
import { Button } from "@/shared/ui";
import { IconChevron } from "@/shared/icons";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import { parseAddress } from "@/shared/utils/address";
import type { CustomerInfo } from "@/shared/types";
import type { UserAddress } from "@/lib/addressesDb";
import type { DeliverySetting } from "@/lib/deliveryDb";

interface CheckoutPageProps {
  defaultValues?: Partial<CustomerInfo>;
  addresses?: UserAddress[];
  deliverySettings: DeliverySetting[];
  isAuthenticated: boolean;
}

export function CheckoutPage({
  defaultValues,
  addresses,
  deliverySettings,
  isAuthenticated,
}: CheckoutPageProps) {
  const { items, total, isHydrated } = useCart();
  const [emirate, setEmirate] = useState(() =>
    extractEmirateFromAddress(defaultValues?.address ?? "", addresses),
  );

  const delivery = calculateDelivery(total, emirate, deliverySettings);

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
          <CheckoutFormSection
            defaultValues={defaultValues}
            addresses={addresses}
            deliverySettings={deliverySettings}
            isAuthenticated={isAuthenticated}
            emirate={emirate}
            onEmirateChange={setEmirate}
          />
          <OrderSummary
            deliveryFee={delivery.fee}
            isFreeDelivery={delivery.isFreeDelivery}
            deliveryDays={delivery.deliveryDays}
            originalFee={
              deliverySettings.find(
                (s) => s.emirate.toLowerCase() === emirate.toLowerCase(),
              )?.delivery_fee
            }
            freeThreshold={
              deliverySettings.find(
                (s) => s.emirate.toLowerCase() === emirate.toLowerCase(),
              )?.free_delivery_threshold ?? undefined
            }
            emirate={emirate}
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
