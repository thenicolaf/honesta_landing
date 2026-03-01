"use client";

import { useActionState } from "react";
import { useCart } from "@/providers";
import { submitCheckout } from "./actions";
import { CheckoutForm } from "./ui/CheckoutForm";
import { OrderSummary } from "./ui/OrderSummary";
import { DELIVERY_FEE } from "@/shared/consts";
import { CustomerInfo } from "@/shared/types";
import { CartEmpty } from "@/shared/ui/CartEmpty";
import { Loader } from "@/shared/ui/Loader";

interface CheckoutPageProps {
  defaultValues?: Partial<CustomerInfo>;
}

export function CheckoutPage({ defaultValues }: CheckoutPageProps) {
  const { items, total, isHydrated } = useCart();

  const [state, formAction] = useActionState(
    submitCheckout.bind(null, items),
    null,
  );

  if (!isHydrated) {
    return (
      <main className="grow">
        <Loader />
      </main>
    );
  }

  if (items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <main className="grow bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          Checkout
        </p>
        <h1
          className="font-display font-bold italic text-heading text-center mb-10 leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Your Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <form action={formAction} className="flex flex-col gap-5">
            <CheckoutForm
              defaultValues={defaultValues}
              error={state?.error ?? null}
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
