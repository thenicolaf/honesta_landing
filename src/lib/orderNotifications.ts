interface OrderForNotification {
  first_name: string | null;
  last_name: string | null;
  total: number | string;
}

interface OrderItemForNotification {
  name: string;
  quantity: number;
}

const MAX_NAMED_ITEMS = 2;

export function formatOrderNotificationMessage(
  order: OrderForNotification,
  items: OrderItemForNotification[],
): string {
  const name = [order.first_name, order.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const parts: string[] = [];
  if (name) parts.push(name);

  if (items.length > 0) {
    const head = items
      .slice(0, MAX_NAMED_ITEMS)
      .map((i) => `${i.quantity}× ${i.name}`);
    const extra = items.length - MAX_NAMED_ITEMS;
    const itemsText = extra > 0 ? [...head, `+${extra} more`].join(", ") : head.join(", ");
    parts.push(`${totalQty} items · ${itemsText}`);
  }

  parts.push(`AED ${Number(order.total).toFixed(2)}`);

  return parts.join(" · ");
}
