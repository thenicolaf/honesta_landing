"use client";

import { Button, buttonVariants, Card } from "@/shared/ui";
import { useCart } from "@/providers";
import { getCartTotals } from "@/lib/cart";
import { HashLink } from "@/sections";
import { cn } from "@/shared/utils/cn";

export function CartSummary() {
  const { items, appliedPromoCode, promoDiscount } = useCart();
  const { originalSubtotal, promotionDiscount, total } = getCartTotals(
    items,
    promoDiscount,
  );

  const hasAdjustments = promotionDiscount > 0 || promoDiscount > 0;

  return (
    <>
      <Card variant="sand" padding="md" className="mb-6">
        <div className="flex flex-col gap-2">
          {hasAdjustments && (
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-body font-light text-earth/60 text-sm min-w-0 wrap-break-word">
                Subtotal
              </span>
              <span className="font-body font-semibold text-earth text-sm shrink-0 whitespace-nowrap">
                AED {originalSubtotal.toFixed(2)}
              </span>
            </div>
          )}

          {promotionDiscount > 0 && (
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-body font-light text-moss text-sm min-w-0 wrap-break-word">
                Discount
              </span>
              <span className="font-body font-semibold text-moss text-sm shrink-0 whitespace-nowrap">
                −AED {promotionDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {appliedPromoCode && promoDiscount > 0 && (
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-body font-light text-moss text-sm min-w-0 wrap-break-word">
                Promo code{" "}
                <span className="font-mono tracking-widest">
                  {appliedPromoCode.code}
                </span>
              </span>
              <span className="font-body font-semibold text-moss text-sm shrink-0 whitespace-nowrap">
                −AED {promoDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div
            className={cn(
              "flex justify-between items-baseline gap-3",
              hasAdjustments && "border-t border-parchment/60 pt-2 mt-1",
            )}
          >
            <span className="font-body font-semibold text-earth text-base min-w-0 wrap-break-word">
              Total
            </span>
            <span className="font-body font-semibold text-orange text-lg shrink-0 whitespace-nowrap">
              AED {total.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button className="w-full" href="/checkout">
          Proceed to Checkout
        </Button>
        <HashLink
          href="/#products"
          className={buttonVariants({ variant: "text", size: "sm" }) + " text-earth/50 hover:text-orange mx-auto"}
        >
          Continue Shopping
        </HashLink>
      </div>
    </>
  );
}
