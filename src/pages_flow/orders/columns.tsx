import type { ColumnDef } from "@/shared/ui";
import {
  formatAed,
  formatDateTime,
  compareNumber,
  compareDate,
  compareString,
} from "@/shared/ui/Table";
import { CopyText } from "@/shared/ui";
import { StatusBadge } from "./ui/StatusBadge";
import { CopyOrderId } from "./ui/CopyOrderId";
import type { Order, AdminOrder } from "./types";

// ─── Shared columns (used by both user & admin tables) ───────────────────────

type OrderKey =
  | "id"
  | "status"
  | "items"
  | "pricing"
  | "address"
  | "date"
  | "customer"
  | "notes";

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
    <div className="flex flex-col gap-1">
      {o.order_items.map((item) => (
        <div
          key={item.id}
          className="flex items-baseline justify-between gap-3"
        >
          <span className="text-sm text-earth">
            {item.name}
            <span className="text-earth/40 ml-1">×{item.quantity}</span>
          </span>
          <span className="text-2xs text-earth/50 whitespace-nowrap">
            {formatAed(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  ),
  headerClassName: "min-w-56",
};

export const pricingColumn: ColumnDef<Order, OrderKey> = {
  key: "pricing",
  header: "Cost",
  cell: (o) => (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between gap-3">
        <span className="text-2xs text-earth/50">Subtotal</span>
        <span className="text-2xs text-earth/60">{formatAed(o.subtotal)}</span>
      </div>
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
  ),
  sortable: true,
  compare: compareNumber((o) => o.total),
  headerClassName: "min-w-44",
};

export const addressColumn: ColumnDef<Order, OrderKey> = {
  key: "address",
  header: "Address",
  cell: (o) =>
    o.address ? (
      <CopyText text={o.address} className="text-2xs text-earth/60">
        <span>{o.address}</span>
      </CopyText>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  headerClassName: "min-w-64",
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
      <span className="text-2xs text-earth/40">{o.phone}</span>
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

// ─── Column sets ─────────────────────────────────────────────────────────────

export const userOrderColumns: ColumnDef<Order, OrderKey>[] = [
  orderIdColumn,
  statusColumn,
  itemsColumn,
  pricingColumn,
  addressColumn,
  dateColumn,
];

export const adminOrderColumns: ColumnDef<AdminOrder, OrderKey>[] = [
  orderIdColumn as ColumnDef<AdminOrder, OrderKey>,
  customerColumn,
  statusColumn as ColumnDef<AdminOrder, OrderKey>,
  itemsColumn as ColumnDef<AdminOrder, OrderKey>,
  pricingColumn as ColumnDef<AdminOrder, OrderKey>,
  addressColumn as ColumnDef<AdminOrder, OrderKey>,
  notesColumn,
  dateColumn as ColumnDef<AdminOrder, OrderKey>,
];
