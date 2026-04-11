import {
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardField,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
} from "@/shared/ui";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { IconReceipt } from "@/shared/icons";
import { StatusBadge } from "./StatusBadge";
import { CopyOrderId } from "./CopyOrderId";
import { displayAddress } from "@/shared/utils/address";
import type { Order } from "../types";

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
        <DataCard key={order.id}>
          <DataCardHeader>
            <CopyOrderId id={order.id} />
            <StatusBadge status={order.status} />
          </DataCardHeader>

          <DataCardBody>
            <DataCardField label="Items">
              <div className="flex flex-col gap-1">
                {order.order_items.map((item) => {
                  const hasPromotion =
                    item.original_price != null &&
                    item.original_price > item.price;
                  const promoPerUnit = item.promo_discount ?? 0;
                  const hasPromoCode = promoPerUnit > 0;
                  const finalLineTotal =
                    Math.max(0, item.price - promoPerUnit) * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-sm text-earth">
                        {item.name}
                        <span className="text-earth/40 ml-1">
                          ×{item.quantity}
                        </span>
                      </span>
                      <div className="shrink-0 flex flex-col items-end whitespace-nowrap">
                        <span
                          className={
                            hasPromoCode
                              ? "text-2xs text-moss font-semibold"
                              : hasPromotion
                                ? "text-2xs text-orange font-semibold"
                                : "text-2xs text-earth/60"
                          }
                        >
                          {formatAed(finalLineTotal)}
                        </span>
                        {hasPromoCode && (
                          <span className="text-2xs text-earth/30 line-through">
                            {formatAed(item.price * item.quantity)}
                          </span>
                        )}
                        {hasPromotion && (
                          <span className="text-2xs text-earth/30 line-through">
                            {formatAed(
                              (item.original_price ?? 0) * item.quantity,
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DataCardField>

            <DataCardField label="Cost">
              {(() => {
                const promotionDiscount = order.promotion_discount ?? 0;
                const originalSubtotal = order.subtotal + promotionDiscount;
                return (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-2xs text-earth/50">Subtotal</span>
                      <span className="text-2xs text-earth/60">
                        {formatAed(originalSubtotal)}
                      </span>
                    </div>
                    {promotionDiscount > 0 && (
                      <div className="flex justify-between gap-3">
                        <span className="text-2xs text-orange">Promotion</span>
                        <span className="text-2xs text-orange">
                          −{formatAed(promotionDiscount)}
                        </span>
                      </div>
                    )}
                    {order.promo_discount > 0 && (
                      <div className="flex justify-between gap-3">
                        <span className="text-2xs text-moss">
                          Promo
                          {order.promo_code?.code && (
                            <span className="font-mono tracking-widest ml-1">
                              {order.promo_code.code}
                            </span>
                          )}
                        </span>
                        <span className="text-2xs text-moss">
                          −{formatAed(order.promo_discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <span className="text-2xs text-earth/50">Delivery</span>
                      <span className="text-2xs text-earth/60">
                        {formatAed(order.delivery_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 pt-2 border-t border-earth/8 mt-0.5">
                      <span className="text-sm font-semibold text-earth">
                        Total
                      </span>
                      <span className="text-sm font-semibold text-earth">
                        {formatAed(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </DataCardField>

            <DataCardField label="Address">
              {order.address ? (
                <CopyText
                  text={displayAddress(order.address)}
                  className="text-2xs text-earth/60"
                >
                  <span>{displayAddress(order.address)}</span>
                </CopyText>
              ) : (
                <span className="text-2xs text-earth/20">—</span>
              )}
            </DataCardField>
          </DataCardBody>

          <DataCardFooter className="flex items-center justify-end">
            <span className="text-2xs text-earth/50">
              {formatDateTime(order.created_at)}
            </span>
          </DataCardFooter>
        </DataCard>
      ))}
    </DataCardList>
  );
}
