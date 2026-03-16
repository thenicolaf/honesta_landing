"use client";

import { useActionState, useEffect, useRef } from "react";
import { useCart } from "@/providers";
import { submitCheckout } from "./actions";
import { CheckoutForm } from "./ui/CheckoutForm";
import { OrderSummary } from "./ui/OrderSummary";
import { DELIVERY_FEE } from "@/shared/consts";
import { CustomerInfo } from "@/shared/types";
import { CartEmpty } from "@/shared/ui/CartEmpty";
import { Loader } from "@/shared/ui/Loader";
import { Button, toastError } from "@/shared/ui";
import { IconChevron } from "@/shared/icons";

interface CheckoutPageProps {
  defaultValues?: Partial<CustomerInfo>;
}

export function CheckoutPage({ defaultValues }: CheckoutPageProps) {
  const { items, total, isHydrated } = useCart();

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
    return <CartEmpty />;
  }

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          Checkout
        </p>
        <div className="relative flex items-center justify-center mb-10">
          <Button href="/cart" variant="outline" size="sm" className="absolute left-0 gap-1.5">
            <IconChevron className="w-3.5 h-3.5 rotate-90" aria-hidden />
            Back to cart
          </Button>
          <h1
            className="font-display font-bold italic text-heading leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Your Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <form action={formAction} className="flex flex-col gap-5">
            <CheckoutForm
              defaultValues={defaultValues}
              fieldErrors={state?.fieldErrors}
              totalWithDelivery={total + DELIVERY_FEE}
            />
          </form>
          <OrderSummary />
        </div>
      </div>
    </main>
  );
}
