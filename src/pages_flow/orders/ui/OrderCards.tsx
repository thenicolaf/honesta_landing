import {
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
} from "@/shared/ui";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { IconReceipt } from "@/shared/icons";
import { StatusBadge } from "./StatusBadge";
import { CopyOrderId } from "./CopyOrderId";
import { OrderMixComposition } from "./OrderMixComposition";
import { displayAddress } from "@/shared/utils/address";
import type { Order } from "../types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemLine({ item }: { item: Order["order_items"][number] }) {
  const hasPromotion =
    item.original_price != null && item.original_price > item.price;
  const promoPerUnit = item.promo_discount ?? 0;
  const hasPromoCode = promoPerUnit > 0;
  const finalLineTotal = Math.max(0, item.price - promoPerUnit) * item.quantity;

  const priceColor = hasPromoCode
    ? "text-moss font-semibold"
    : hasPromotion
      ? "text-orange font-semibold"
      : "text-earth/60";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs text-earth truncate">
          {item.name} <span className="text-earth/40">×{item.quantity}</span>
        </span>
        <span className={`text-2xs shrink-0 ${priceColor}`}>
          {formatAed(finalLineTotal)}
        </span>
      </div>
      <OrderMixComposition items={item.mix_composition} />
    </div>
  );
}

function CostBreakdown({ order }: { order: Order }) {
  const promotionDiscount = order.promotion_discount ?? 0;
  const originalSubtotal = order.subtotal + promotionDiscount;

  return (
    <div className="flex flex-col gap-0.5 text-2xs">
      <div className="flex justify-between">
        <span className="text-earth/50">Subtotal</span>
        <span className="text-earth/60">{formatAed(originalSubtotal)}</span>
      </div>
      {promotionDiscount > 0 && (
        <div className="flex justify-between">
          <span className="text-orange">Promotion</span>
          <span className="text-orange">−{formatAed(promotionDiscount)}</span>
        </div>
      )}
      {order.promo_discount > 0 && (
        <div className="flex justify-between">
          <span className="text-moss">
            Promo
            {order.promo_code?.code && (
              <span className="font-mono tracking-widest ml-1">
                {order.promo_code.code}
              </span>
            )}
          </span>
          <span className="text-moss">−{formatAed(order.promo_discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-earth/50">Delivery</span>
        <span className="text-earth/60">{formatAed(order.delivery_fee)}</span>
      </div>
      <div className="flex justify-between pt-1 border-t border-earth/8 mt-0.5">
        <span className="text-xs font-semibold text-earth">Total</span>
        <span className="text-xs font-semibold text-earth">
          {formatAed(order.total)}
        </span>
      </div>
    </div>
  );
}

// ─── OrderCards ────────────────────────────────────────────────────────────────

export function OrderCards({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <DataCardEmpty
        icon={<IconReceipt className="w-10 h-10 text-earth/15" />}
        label="No orders yet"
        description="Your completed orders will appear here once you make a purchase."
      />
    );
  }

  return (
    <DataCardList className="sm:grid-cols-2">
      {orders.map((order) => (
        <DataCard key={order.id} className="flex flex-col">
          <DataCardHeader>
            <CopyOrderId id={order.id} />
            <StatusBadge status={order.status} />
          </DataCardHeader>

          <DataCardBody className="gap-0 flex-1">
            <div className="flex flex-col gap-2 grow mb-2">
              {order.order_items.map((item) => (
                <ItemLine key={item.id} item={item} />
              ))}
            </div>
            <div className="border-t border-earth/8 pt-1 mt-1">
              <CostBreakdown order={order} />
            </div>
            {order.address && (
              <CopyText
                text={displayAddress(order.address)}
                className="text-2xs text-earth/50 truncate mt-1.5"
              >
                <span className="truncate">
                  {displayAddress(order.address)}
                </span>
              </CopyText>
            )}
          </DataCardBody>

          <DataCardFooter className="flex items-center justify-end">
            <span className="text-2xs text-earth/40">
              {formatDateTime(order.created_at)}
            </span>
          </DataCardFooter>
        </DataCard>
      ))}
    </DataCardList>
  );
}
