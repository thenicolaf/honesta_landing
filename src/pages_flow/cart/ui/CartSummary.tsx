"use client";

import { Button, Card } from "@/shared/ui";
import { useCart } from "@/providers";
import { DELIVERY_FEE } from "@/shared/consts";

export function CartSummary() {
  const { items, total } = useCart();

  const totalDiscount = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <>
      <Card variant="sand" padding="md" className="mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body font-light text-earth/60 text-sm">
              Subtotal
            </span>
            <span className="font-body font-semibold text-earth text-sm">
              AED {total.toFixed(2)}
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
            <span className="font-body font-semibold text-earth text-sm">
              AED {DELIVERY_FEE}
            </span>
          </div>
          <div className="border-t border-parchment/60 pt-2 mt-1 flex justify-between items-center">
            <span className="font-body font-semibold text-earth text-base">
              Total
            </span>
            <span className="font-body font-semibold text-orange text-lg">
              AED {(total + DELIVERY_FEE).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button className="w-full" href="/checkout">
          Proceed to Checkout
        </Button>
        <Button
          href="/#products"
          variant="outline"
          size="sm"
          className="border-transparent hover:border-transparent text-earth/50 hover:text-orange hover:bg-transparent"
        >
          Continue Shopping
        </Button>
      </div>
    </>
  );
}
