interface OrderForNotification {
  first_name: string | null;
  last_name: string | null;
  total: number | string;
  delivery_schedule?: string | null;
}

interface OrderItemForNotification {
  name: string;
  quantity: number;
}

const MAX_NAMED_ITEMS = 2;

export interface OrderNotificationParts {
  /** Customer full name. */
  customer: string | null;
  /** Total quantity across line items. */
  totalQty: number;
  /** Short list of named items (up to MAX_NAMED_ITEMS) + "+N more" suffix. */
  itemsText: string | null;
  /** Pre-formatted "AED 123.45". */
  totalText: string;
  /** Optional delivery schedule snapshot. */
  deliverySchedule: string | null;
}

/**
 * Returns the structured pieces of an order notification. Used by:
 *  - push notifications + in-app realtime, via {@link formatOrderNotificationMessage}
 *    (joined with " · " into a single line);
 *  - the result/cancel page toast, which renders each piece on its own row.
 */
export function buildOrderNotificationParts(
  order: OrderForNotification,
  items: OrderItemForNotification[],
): OrderNotificationParts {
  const customer =
    [order.first_name, order.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  let itemsText: string | null = null;
  if (items.length > 0) {
    const head = items
      .slice(0, MAX_NAMED_ITEMS)
      .map((i) => `${i.quantity}× ${i.name}`);
    const extra = items.length - MAX_NAMED_ITEMS;
    itemsText =
      extra > 0 ? [...head, `+${extra} more`].join(", ") : head.join(", ");
  }

  return {
    customer,
    totalQty,
    itemsText,
    totalText: `AED ${Number(order.total).toFixed(2)}`,
    deliverySchedule: order.delivery_schedule ?? null,
  };
}

export function formatOrderNotificationMessage(
  order: OrderForNotification,
  items: OrderItemForNotification[],
): string {
  const parts = buildOrderNotificationParts(order, items);
  const segments: string[] = [];
  if (parts.customer) segments.push(parts.customer);
  if (parts.itemsText) segments.push(`${parts.totalQty} items · ${parts.itemsText}`);
  segments.push(parts.totalText);
  if (parts.deliverySchedule) segments.push(parts.deliverySchedule);
  return segments.join(" · ");
}
