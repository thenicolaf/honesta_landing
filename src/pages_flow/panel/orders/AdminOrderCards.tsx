import {
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
  MixCompositionList,
} from "@/shared/ui";
import { displayAddress } from "@/shared/utils/address";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { IconReceipt } from "@/shared/icons";
import { StatusBadge } from "@/pages_flow/orders/ui/StatusBadge";
import { CopyOrderId } from "@/pages_flow/orders/ui/CopyOrderId";
import type { AdminOrder } from "@/pages_flow/orders/types";
import { FulfilledToggle } from "./FulfilledToggle";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemLine({ item }: { item: AdminOrder["order_items"][number] }) {
  const hasPromotion = item.original_price != null && item.original_price > item.price;
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
      <MixCompositionList items={item.mix_composition} />
    </div>
  );
}

function CustomerInfo({ order }: { order: AdminOrder }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-2xs text-earth">
        {order.first_name} {order.last_name}
      </span>
      <span className="text-2xs text-earth/40">{order.email}</span>
      {(order.gender || order.birthday) && (
        <span className="text-2xs text-earth/30">
          {order.gender ? order.gender.charAt(0).toUpperCase() + order.gender.slice(1) : null}
          {order.gender && order.birthday ? " · " : null}
          {order.birthday
            ? new Date(order.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : null}
        </span>
      )}
    </div>
  );
}

function CostBreakdown({ order }: { order: AdminOrder }) {
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
            Promo{order.promo_code?.code && <span className="font-mono tracking-widest ml-1">{order.promo_code.code}</span>}
          </span>
          <span className="text-moss">−{formatAed(order.promo_discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-earth/50">Delivery</span>
        <span className="text-earth/60">{formatAed(order.delivery_fee)}</span>
      </div>
      <div className="flex justify-between pt-1 border-t border-earth/8 mt-0.5">
        <span className="text-sm font-semibold text-earth">Total</span>
        <span className="text-sm font-semibold text-earth">{formatAed(order.total)}</span>
      </div>
    </div>
  );
}

// ─── AdminOrderCards ──────────────────────────────────────────────────────────

interface AdminOrderCardsProps {
  orders: AdminOrder[];
  emptyDescription?: string;
}

export function AdminOrderCards({
  orders,
  emptyDescription,
}: AdminOrderCardsProps) {
  if (orders.length === 0) {
    return (
      <DataCardEmpty
        icon={<IconReceipt className="w-10 h-10 text-earth/15" />}
        label="No orders found"
        description={emptyDescription}
      />
    );
  }

  return (
    <DataCardList className="sm:grid-cols-2">
      {orders.map((order) => (
        <DataCard key={order.id} className="flex flex-col">
          <DataCardHeader>
            <div className="flex items-center gap-2">
              <FulfilledToggle orderId={order.id} defaultChecked={order.is_fulfilled} />
              <CopyOrderId id={order.id} />
            </div>
            <StatusBadge status={order.status} />
          </DataCardHeader>

          <DataCardBody className="gap-0 flex-1">
            <CustomerInfo order={order} />

            <div className="flex flex-col gap-2 mt-2 mb-2">
              {order.order_items.map((item) => (
                <ItemLine key={item.id} item={item} />
              ))}
            </div>

            <div className="border-t border-earth/8 pt-1 mt-auto">
              <CostBreakdown order={order} />
            </div>

            {order.delivery_schedule && (
              <p className="text-2xs text-earth/55 mt-1.5">
                <span className="text-earth/40">Delivery: </span>
                {order.delivery_schedule}
              </p>
            )}

            {order.address && (
              <CopyText
                text={displayAddress(order.address)}
                className="text-2xs text-earth/50 truncate mt-1.5"
              >
                <span className="truncate">{displayAddress(order.address)}</span>
              </CopyText>
            )}

            {order.notes && (
              <p className="text-2xs text-earth/40 italic mt-1 truncate">
                {order.notes}
              </p>
            )}
          </DataCardBody>

          <DataCardFooter className="flex items-center justify-between">
            <CopyText text={order.phone} className="text-2xs text-earth/40">{order.phone}</CopyText>
            <span className="text-2xs text-earth/40">
              {formatDateTime(order.created_at)}
            </span>
          </DataCardFooter>
        </DataCard>
      ))}
    </DataCardList>
  );
}
