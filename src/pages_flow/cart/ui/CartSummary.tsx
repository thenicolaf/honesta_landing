"use client";

import { Button, Card, DeliveryInfo } from "@/shared/ui";
import { useCart } from "@/providers";
import { formatDeliveryDaysRange } from "@/shared/utils/calculateDelivery";
import type { DeliverySetting } from "@/lib/deliveryDb";
import { HashLink } from "@/sections";
import { cn } from "@/shared/utils/cn";

interface CartSummaryProps {
  deliverySettings: DeliverySetting[];
}

export function CartSummary({ deliverySettings }: CartSummaryProps) {
  const { items, total } = useCart();

  const totalDiscount = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const freeThreshold = deliverySettings.find(
    (s) => s.emirate === "Dubai",
  )?.free_delivery_threshold;

  return (
    <>
      <Card variant="sand" padding="md" className="mb-6">
        <div className="flex flex-col gap-2">
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
          <div className={cn("flex justify-between items-center", totalDiscount > 0 && "border-t border-parchment/60 pt-2 mt-1")}>
            <span className="font-body font-semibold text-earth text-base">
              Total
            </span>
            <span className="font-body font-semibold text-orange text-lg">
              AED {total.toFixed(2)}
            </span>
          </div>

          <DeliveryInfo
            label={`${formatDeliveryDaysRange(deliverySettings)}${freeThreshold ? ` · Free in Dubai from AED ${freeThreshold}` : ""}`}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button className="w-full" href="/checkout">
          Proceed to Checkout
        </Button>
        <HashLink href="/#products" className="text-center">
          <Button
            variant={"text"}
            type="button"
            as="button"
            size={"sm"}
            className="text-earth/50 hover:text-orange mx-auto"
          >
            Continue Shopping
          </Button>
        </HashLink>
      </div>
    </>
  );
}
