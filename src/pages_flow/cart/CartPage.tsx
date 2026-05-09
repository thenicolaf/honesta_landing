"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/providers";
import { trackViewCart } from "@/lib/analytics";
import { EmptyCart } from "./EmptyCart";
import { CartGrid } from "./ui/CartGrid";
import { CartSummary } from "./ui/CartSummary";
import { PromoCodeBlock } from "./ui/PromoCodeBlock";
import { ClearCartButton } from "./ui/ClearCartButton";
import { buttonVariants } from "@/shared/ui";
import { CartSkeleton } from "./ui/CartSkeleton";
import { HashLink } from "@/sections/navbar";
import type { ActivePromotionsMap } from "@/lib/promotionsDb";

interface CartPageProps {
  isAuthenticated: boolean;
  activePromotions: ActivePromotionsMap;
  /** Server-rendered slot below the cart summary (e.g. PromoSliderSection). */
  belowContent?: ReactNode;
}

export function CartPage({
  isAuthenticated,
  activePromotions,
  belowContent,
}: CartPageProps) {
  const { items, total, isHydrated, applyServerPromotions, refresh } = useCart();

  useLayoutEffect(() => {
    applyServerPromotions(activePromotions);
  }, [activePromotions, applyServerPromotions]);

  // Re-pull cart from DB / Supabase on mount so price/name/image edits made by
  // admin since the last layout-mount sync are reflected. Ref-guarded — `refresh`
  // identity changes when items change, but we only want this to fire once.
  const refreshedOnMount = useRef(false);
  useEffect(() => {
    if (refreshedOnMount.current || !isHydrated) return;
    refreshedOnMount.current = true;
    void refresh({ force: true });
  }, [isHydrated, refresh]);

  const firedViewCart = useRef(false);
  useEffect(() => {
    if (firedViewCart.current) return;
    if (!isHydrated || items.length === 0) return;
    firedViewCart.current = true;
    trackViewCart(items, total);
  }, [isHydrated, items, total]);

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
          <CartSummary />
        </div>
      </div>
      {belowContent}
    </main>
  );
}
