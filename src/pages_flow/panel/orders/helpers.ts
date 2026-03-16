import { OrderStatus } from "@/shared/types";
import type { AdminOrder } from "@/pages_flow/orders/types";

// ─── Status filter options ──────────────────────────────────────────────────

export const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.PAID, label: "Paid" },
  { value: OrderStatus.FAILED, label: "Failed" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

// ─── Search ─────────────────────────────────────────────────────────────────

export function searchAdminOrder(order: AdminOrder, term: string): boolean {
  const haystack =
    `${order.id} ${order.first_name} ${order.last_name} ${order.email} ${order.phone}`.toLowerCase();
  return haystack.includes(term);
}

// ─── Filter pipeline ────────────────────────────────────────────────────────

export function filterOrders(
  orders: AdminOrder[],
  status: string,
  search: string,
): AdminOrder[] {
  let result = orders;

  if (status) {
    result = result.filter((o) => o.status === status);
  }

  const trimmed = search.trim().toLowerCase();
  if (trimmed) {
    result = result.filter((o) => searchAdminOrder(o, trimmed));
  }

  return result;
}
