"use client";

import { useCart } from "@/providers";
import { CartEmpty } from "@/shared/ui/CartEmpty";
import { CartItems } from "./ui/CartItems";
import { CartSummary } from "./ui/CartSummary";
import { PageLoader } from "@/shared/ui";

export function CartPage() {
  const { items, isHydrated } = useCart();

  if (!isHydrated) {
    return <PageLoader />;
  }

  if (items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          Your Order
        </p>
        <h1
          className="font-display font-bold italic text-heading text-center mb-10 leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Shopping Cart
        </h1>

        <CartItems />
        <CartSummary />
      </div>
    </main>
  );
}
