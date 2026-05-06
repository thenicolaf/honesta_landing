import type { ColumnDef } from "@/shared/ui";
import {
  formatAed,
  formatDateTime,
  compareNumber,
  compareDate,
  compareString,
} from "@/shared/ui/Table";
import { CopyText, MixCompositionList } from "@/shared/ui";
import { displayAddress } from "@/shared/utils/address";
import { StatusBadge } from "./ui/StatusBadge";
import { CopyOrderId } from "./ui/CopyOrderId";
import type { Order, AdminOrder } from "./types";
import { FulfilledToggle } from "@/pages_flow/panel/orders/FulfilledToggle";

// ─── Shared columns (used by both user & admin tables) ───────────────────────

type OrderKey =
  | "id"
  | "status"
  | "items"
  | "pricing"
  | "address"
  | "delivery"
  | "date"
  | "customer"
  | "notes"
  | "fulfilled";

export const orderIdColumn: ColumnDef<Order, OrderKey> = {
  key: "id",
  header: "Order",
  cell: (o) => <CopyOrderId id={o.id} />,
  headerClassName: "min-w-28",
};

export const statusColumn: ColumnDef<Order, OrderKey> = {
  key: "status",
  header: "Status",
  cell: (o) => <StatusBadge status={o.status} />,
  sortable: true,
  compare: compareString((o) => o.status),
  headerClassName: "min-w-28",
};

export const itemsColumn: ColumnDef<Order, OrderKey> = {
  key: "items",
  header: "Items",
  cell: (o) => (
    <div className="flex flex-col gap-3">
      {o.order_items.map((item) => {
        const hasPromotion =
          item.original_price != null && item.original_price > item.price;
        const promoPerUnit = item.promo_discount ?? 0;
        const hasPromoCode = promoPerUnit > 0;
        const finalLineTotal =
          Math.max(0, item.price - promoPerUnit) * item.quantity;
        return (
          <div key={item.id} className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-earth">
                {item.name}
                <span className="text-earth/40 ml-1">×{item.quantity}</span>
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
                    {formatAed((item.original_price ?? 0) * item.quantity)}
                  </span>
                )}
              </div>
            </div>
            <MixCompositionList items={item.mix_composition} />
          </div>
        );
      })}
    </div>
  ),
  headerClassName: "min-w-80",
};

export const pricingColumn: ColumnDef<Order, OrderKey> = {
  key: "pricing",
  header: "Cost",
  cell: (o) => {
    const promotionDiscount = o.promotion_discount ?? 0;
    const originalSubtotal = o.subtotal + promotionDiscount;
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
        {o.promo_discount > 0 && (
          <div className="flex justify-between gap-3">
            <span className="text-2xs text-moss">
              Promo
              {o.promo_code?.code && (
                <span className="font-mono tracking-widest ml-1">
                  {o.promo_code.code}
                </span>
              )}
            </span>
            <span className="text-2xs text-moss">
              −{formatAed(o.promo_discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-2xs text-earth/50">Delivery</span>
          <span className="text-2xs text-earth/60">
            {formatAed(o.delivery_fee)}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-0.5 border-t border-earth/8 mt-0.5">
          <span className="text-sm font-semibold text-earth">Total</span>
          <span className="text-sm font-semibold text-earth">
            {formatAed(o.total)}
          </span>
        </div>
      </div>
    );
  },
  sortable: true,
  compare: compareNumber((o) => o.total),
  headerClassName: "min-w-56",
};

export const addressColumn: ColumnDef<Order, OrderKey> = {
  key: "address",
  header: "Address",
  cell: (o) =>
    o.address ? (
      <CopyText text={displayAddress(o.address)} className="text-2xs text-earth/60">
        <span>{displayAddress(o.address)}</span>
      </CopyText>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  headerClassName: "min-w-64",
};

export const deliveryColumn: ColumnDef<Order, OrderKey> = {
  key: "delivery",
  header: "Delivery",
  cell: (o) =>
    o.delivery_schedule ? (
      <span className="text-2xs text-earth/65 whitespace-nowrap">
        {o.delivery_schedule}
      </span>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  sortable: true,
  compare: compareString((o) => o.delivery_schedule ?? ""),
  headerClassName: "min-w-56",
};

export const dateColumn: ColumnDef<Order, OrderKey> = {
  key: "date",
  header: "Date",
  cell: (o) => (
    <span className="text-2xs text-earth/60 whitespace-nowrap">
      {formatDateTime(o.created_at)}
    </span>
  ),
  sortable: true,
  compare: compareDate((o) => o.created_at),
  headerClassName: "min-w-40",
};

// ─── Admin-only columns ─────────────────────────────────────────────────────

export const customerColumn: ColumnDef<AdminOrder, OrderKey> = {
  key: "customer",
  header: "Customer",
  cell: (o) => (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-sm">
        {o.first_name} {o.last_name}
      </span>
      <span className="text-2xs text-earth/50">{o.email}</span>
      <CopyText text={o.phone} className="text-2xs text-earth/40">{o.phone}</CopyText>
      {(o.gender || o.birthday) && (
        <span className="text-2xs text-earth/30">
          {o.gender
            ? o.gender.charAt(0).toUpperCase() + o.gender.slice(1)
            : null}
          {o.gender && o.birthday ? " · " : null}
          {o.birthday
            ? new Date(o.birthday).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null}
        </span>
      )}
    </div>
  ),
  sortable: true,
  compare: compareString((o) => `${o.first_name} ${o.last_name}`),
  headerClassName: "min-w-48",
};

export const notesColumn: ColumnDef<AdminOrder, OrderKey> = {
  key: "notes",
  header: "Notes",
  cell: (o) =>
    o.notes ? (
      <span className="text-2xs text-earth/60 line-clamp-3 italic">
        {o.notes}
      </span>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  headerClassName: "min-w-44",
};

export const fulfilledColumn: ColumnDef<AdminOrder, OrderKey> = {
  key: "fulfilled",
  header: "Fulfilled",
  cell: (o) => (
    <div className="flex justify-center">
      <FulfilledToggle orderId={o.id} defaultChecked={o.is_fulfilled} />
    </div>
  ),
  headerClassName: "min-w-24 text-center",
};

// ─── Column sets ─────────────────────────────────────────────────────────────

export const userOrderColumns: ColumnDef<Order, OrderKey>[] = [
  orderIdColumn,
  statusColumn,
  itemsColumn,
  pricingColumn,
  deliveryColumn,
  addressColumn,
  dateColumn,
];

export const adminOrderColumns: ColumnDef<AdminOrder, OrderKey>[] = [
  fulfilledColumn,
  orderIdColumn as ColumnDef<AdminOrder, OrderKey>,
  customerColumn,
  statusColumn as ColumnDef<AdminOrder, OrderKey>,
  itemsColumn as ColumnDef<AdminOrder, OrderKey>,
  pricingColumn as ColumnDef<AdminOrder, OrderKey>,
  deliveryColumn as ColumnDef<AdminOrder, OrderKey>,
  addressColumn as ColumnDef<AdminOrder, OrderKey>,
  notesColumn,
  dateColumn as ColumnDef<AdminOrder, OrderKey>,
];
