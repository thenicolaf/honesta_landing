"use client";

import { Card, DeliveryInfo } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { useCart } from "@/providers";
import { getCartTotals } from "@/lib/cart";
import { getPerItemPromoDiscounts } from "@/shared/utils/recalculatePromoDiscount";
import { formatDeliveryDays } from "@/shared/utils/calculateDelivery";
import { cn } from "@/shared/utils/cn";

interface OrderSummaryProps {
  deliveryFee: number;
  isFreeDelivery: boolean;
  originalFee?: number;
  deliveryDays: number;
  freeThreshold?: number;
  emirate: string;
}

export function OrderSummary({
  deliveryFee,
  isFreeDelivery,
  originalFee,
  deliveryDays,
  freeThreshold,
  emirate,
}: OrderSummaryProps) {
  const { items, appliedPromoCode, promoDiscount } = useCart();
  const { originalSubtotal, promotionDiscount, total } = getCartTotals(
    items,
    promoDiscount,
  );
  const perItemPromoDiscounts = getPerItemPromoDiscounts(
    items,
    appliedPromoCode,
  );

  return (
    <div className="lg:sticky lg:top-24">
      <Card variant="sand" padding="md">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/55 mb-4">
          Order Summary
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {items.map((item) => {
            const promoPerUnit =
              perItemPromoDiscounts.get(item.variantId) ?? 0;
            const hasPromoCodeDiscount = promoPerUnit > 0;
            const finalLineTotal =
              Math.max(0, item.price - promoPerUnit) * item.quantity;
            const hasPromotion =
              item.originalPrice != null && item.originalPrice !== item.price;

            return (
              <div
                key={item.variantId}
                className="flex justify-between items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body font-light text-earth text-sm leading-snug">
                    {item.name}
                    {item.weight_g ? ` (${item.weight_g}g)` : ""}
                  </p>
                  <p className="font-body font-light text-earth/45 text-xs">
                    × {item.quantity}
                  </p>
                  {item.promotionEndsAt && (
                    <p className="font-body text-2xs text-earth/40">
                      Until {formatDateTime(item.promotionEndsAt)}
                    </p>
                  )}
                  {hasPromoCodeDiscount && appliedPromoCode?.endsAt && (
                    <p className="font-body text-2xs text-earth/40">
                      Until {formatDateTime(appliedPromoCode.endsAt)}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={cn(
                      "font-body font-semibold text-sm",
                      hasPromoCodeDiscount
                        ? "text-moss"
                        : hasPromotion
                          ? "text-orange"
                          : "text-earth",
                    )}
                  >
                    AED {finalLineTotal.toFixed(2)}
                  </span>
                  {hasPromoCodeDiscount ? (
                    <p className="font-body text-earth/30 text-xs line-through">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </p>
                  ) : (
                    hasPromotion && (
                      <p className="font-body text-earth/30 text-xs line-through">
                        AED {(item.originalPrice! * item.quantity).toFixed(2)}
                      </p>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-parchment/60 pt-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body font-light text-earth/60 text-sm">
              Subtotal
            </span>
            <span className="font-body font-semibold text-earth text-sm">
              AED {originalSubtotal.toFixed(2)}
            </span>
          </div>
          {promotionDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-body font-light text-moss text-sm">
                Discount
              </span>
              <span className="font-body font-semibold text-moss text-sm">
                −AED {promotionDiscount.toFixed(2)}
              </span>
            </div>
          )}
          {appliedPromoCode && promoDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-body font-light text-moss text-sm">
                Promo code{" "}
                <span className="font-mono tracking-widest">
                  {appliedPromoCode.code}
                </span>
              </span>
              <span className="font-body font-semibold text-moss text-sm">
                −AED {promoDiscount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-body font-light text-earth/60 text-sm">
              Delivery
            </span>
            {isFreeDelivery ? (
              <span className="flex items-center gap-1.5">
                <span className="font-body text-earth/40 text-sm line-through">
                  AED {originalFee}
                </span>
                <span className="font-body font-semibold text-moss text-sm">
                  FREE
                </span>
              </span>
            ) : (
              <span className="font-body font-semibold text-earth text-sm">
                AED {deliveryFee}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-body font-semibold text-earth text-base">
              Total
            </span>
            <span className="font-body font-semibold text-orange text-lg">
              AED {(total + deliveryFee).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-parchment/60">
          <DeliveryInfo
            label={`${formatDeliveryDays(deliveryDays)}${
              freeThreshold
                ? ` · Free in ${emirate} from AED ${freeThreshold}`
                : ""
            }`}
          />
        </div>
      </Card>
    </div>
  );
}
