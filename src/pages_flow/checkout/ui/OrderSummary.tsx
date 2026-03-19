"use client";

import { Card, DeliveryInfo } from "@/shared/ui";
import { useCart } from "@/providers";
import { formatDeliveryDays } from "@/shared/utils/calculateDelivery";

interface OrderSummaryProps {
  deliveryFee: number;
  isFreeDelivery: boolean;
  originalFee?: number;
  deliveryDays: number;
}

export function OrderSummary({
  deliveryFee,
  isFreeDelivery,
  originalFee,
  deliveryDays,
}: OrderSummaryProps) {
  const { items, total } = useCart();

  const totalDiscount = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="lg:sticky lg:top-24">
      <Card variant="sand" padding="md">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/55 mb-4">
          Order Summary
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {items.map((item) => (
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
              </div>
              <span className="font-body font-semibold text-earth text-sm shrink-0">
                AED {item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-parchment/60 pt-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body font-light text-earth/60 text-sm">
              Subtotal
            </span>
            <span className="font-body font-semibold text-earth text-sm">
              AED {total}
            </span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-body font-light text-moss text-sm">
                Discount
              </span>
              <span className="font-body font-semibold text-moss text-sm">
                −AED {totalDiscount.toFixed(2)}
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
          <DeliveryInfo label={formatDeliveryDays(deliveryDays)} />
        </div>
      </Card>
    </div>
  );
}
