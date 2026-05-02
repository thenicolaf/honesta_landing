"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/providers";
import { EmptyCart } from "./EmptyCart";
import { CartGrid } from "./ui/CartGrid";
import { CartSummary } from "./ui/CartSummary";
import { PromoCodeBlock } from "./ui/PromoCodeBlock";
import { ClearCartButton } from "./ui/ClearCartButton";
import { buttonVariants } from "@/shared/ui";
import { CartSkeleton } from "./ui/CartSkeleton";
import { HashLink } from "@/sections/navbar";
import type { DeliverySetting } from "@/lib/deliveryDb";
import type { ActivePromotionsMap } from "@/lib/promotionsDb";

interface CartPageProps {
  deliverySettings: DeliverySetting[];
  isAuthenticated: boolean;
  activePromotions: ActivePromotionsMap;
  /** Server-rendered slot below the cart summary (e.g. PromoSliderSection). */
  belowContent?: ReactNode;
}

export function CartPage({
  deliverySettings,
  isAuthenticated,
  activePromotions,
  belowContent,
}: CartPageProps) {
  const { items, isHydrated, refresh, applyServerPromotions } = useCart();

  useLayoutEffect(() => {
    applyServerPromotions(activePromotions);
  }, [activePromotions, applyServerPromotions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isHydrated) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16">
      <div className="px-4">
        <div className="mx-auto max-w-2xl">
          <HashLink
            href="/#products"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " mb-5 inline-flex"}
          >
            <ArrowLeft size={14} className="mr-2" />
            Back to products
          </HashLink>

          <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
            Your Order
          </p>
          <h1
            className="font-display font-bold italic text-heading text-center mb-10 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Shopping Cart
          </h1>

          <div className="mb-3 flex justify-end">
            <ClearCartButton />
          </div>
          <CartGrid />
          <PromoCodeBlock isAuthenticated={isAuthenticated} />
          <CartSummary deliverySettings={deliverySettings} />
        </div>
      </div>
      {belowContent}
    </main>
  );
}
