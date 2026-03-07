import { AdminPageHeader } from "@/app/(admin)/_components/AdminPageHeader";
import { OrderCard } from "./ui/OrderCard";
import { EmptyOrders } from "./ui/EmptyOrders";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  address: string;
  created_at: string;
  order_items: OrderItem[];
};

function formatDateHeading(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupByDate(orders: Order[]): [string, Order[]][] {
  const map = new Map<string, Order[]>();
  for (const order of orders) {
    const key = new Date(order.created_at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(order);
  }
  return Array.from(map.entries()).map(([, group]) => [
    formatDateHeading(group[0].created_at),
    group,
  ]);
}

export function OrdersPage({ orders }: { orders: Order[] }) {
  const groups = groupByDate(orders);

  return (
    <>
      <AdminPageHeader title="My Orders" />

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([dateLabel, group]) => (
            <div key={dateLabel}>
              <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 mb-3">
                {dateLabel}
              </p>
              <div className="flex flex-col gap-4">
                {group.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
