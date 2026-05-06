"use client";

import { Card, DeliveryInfo, MixCompositionList } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { useCart } from "@/providers";
import { getCartTotals } from "@/lib/cart";
import { getPerItemPromoDiscounts } from "@/shared/utils/recalculatePromoDiscount";
import { cn } from "@/shared/utils/cn";
import type { CartItem } from "@/sections/products/types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryRow({ label, value, color = "earth", bold = false }: {
  label: React.ReactNode;
  value: React.ReactNode;
  color?: "earth" | "moss" | "orange";
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn(
        "font-body text-sm",
        bold ? "font-semibold text-earth text-base" : `font-light text-${color === "earth" ? "earth/60" : color}`,
      )}>
        {label}
      </span>
      <span className={cn(
        "font-body font-semibold",
        bold ? "text-orange text-lg" : `text-${color} text-sm`,
      )}>
        {value}
      </span>
    </div>
  );
}

function OrderLineItem({ item, promoPerUnit, promoCodeEndsAt }: {
  item: CartItem;
  promoPerUnit: number;
  promoCodeEndsAt?: string;
}) {
  const hasPromoCode = promoPerUnit > 0;
  const hasPromotion = item.originalPrice != null && item.originalPrice !== item.price;
  const finalLineTotal = Math.max(0, item.price - promoPerUnit) * item.quantity;

  const priceColor = hasPromoCode ? "text-moss" : hasPromotion ? "text-orange" : "text-earth";
  const strikeAmount = hasPromoCode
    ? item.price * item.quantity
    : hasPromotion
      ? item.originalPrice! * item.quantity
      : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-start gap-2">
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
          {hasPromoCode && promoCodeEndsAt && (
            <p className="font-body text-2xs text-earth/40">
              Until {formatDateTime(promoCodeEndsAt)}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className={cn("font-body font-semibold text-sm", priceColor)}>
            AED {finalLineTotal.toFixed(2)}
          </span>
          {strikeAmount != null && (
            <p className="font-body text-earth/30 text-xs line-through">
              AED {strikeAmount.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      {item.isMix && <MixCompositionList items={item.mixItems} />}
    </div>
  );
}

function DeliveryRow({ fee, isFree, originalFee }: {
  fee: number;
  isFree: boolean;
  originalFee?: number;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-body font-light text-earth/60 text-sm">
        Delivery
      </span>
      {isFree ? (
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
          AED {fee}
        </span>
      )}
    </div>
  );
}

// ─── OrderSummary ─────────────────────────────────────────────────────────────

interface OrderSummaryProps {
  deliveryFee: number;
  isFreeDelivery: boolean;
  originalFee?: number;
  freeThreshold?: number;
  emirate: string;
}

export function OrderSummary({
  deliveryFee,
  isFreeDelivery,
  originalFee,
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

        {/* Line items */}
        <div className="flex flex-col gap-3 mb-4">
          {items.map((item) => (
            <OrderLineItem
              key={item.variantId}
              item={item}
              promoPerUnit={perItemPromoDiscounts.get(item.variantId) ?? 0}
              promoCodeEndsAt={appliedPromoCode?.endsAt}
            />
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-parchment/60 pt-3 flex flex-col gap-2">
          <SummaryRow
            label="Subtotal"
            value={`AED ${originalSubtotal.toFixed(2)}`}
          />
          {promotionDiscount > 0 && (
            <SummaryRow
              label="Discount"
              value={`−AED ${promotionDiscount.toFixed(2)}`}
              color="moss"
            />
          )}
          {appliedPromoCode && promoDiscount > 0 && (
            <SummaryRow
              label={<>Promo code <span className="font-mono tracking-widest">{appliedPromoCode.code}</span></>}
              value={`−AED ${promoDiscount.toFixed(2)}`}
              color="moss"
            />
          )}
          <DeliveryRow
            fee={deliveryFee}
            isFree={isFreeDelivery}
            originalFee={originalFee}
          />
          <SummaryRow
            label="Total"
            value={`AED ${(total + deliveryFee).toFixed(2)}`}
            bold
          />
        </div>

        {freeThreshold && (
          <div className="mt-3 pt-3 border-t border-parchment/60">
            <DeliveryInfo
              label={`Free in ${emirate} from AED ${freeThreshold}`}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
