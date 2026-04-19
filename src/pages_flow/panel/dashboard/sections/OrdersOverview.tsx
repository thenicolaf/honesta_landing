import {
  ShoppingBag,
  DollarSign,
  Users,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { Card, Badge } from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import { OrderStatus } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { StatCard, SectionHeading } from "../ui";
import { ProductSalesSection } from "../ProductSalesSection";
import { getDashboardOrders, getUsersCount } from "../queries";
import type { ProductSales } from "../types";

type OrderRow = {
  status: string;
  total: string;
  delivery_fee: string;
  order_items: { name: string; price: string; quantity: number }[];
};

const STATUS_CONFIG = [
  { key: OrderStatus.PAID, label: "Paid", variant: "natural" as const, icon: <CheckCircle className="w-4 h-4" /> },
  { key: OrderStatus.PENDING, label: "Pending", variant: "warm" as const, icon: <Clock className="w-4 h-4" /> },
  { key: OrderStatus.FAILED, label: "Failed", variant: "outline" as const, icon: <XCircle className="w-4 h-4" />, badgeClassName: "text-red-500 border-red-200" },
  { key: OrderStatus.CANCELLED, label: "Cancelled", variant: "outline" as const, icon: <Ban className="w-4 h-4" />, badgeClassName: "text-red-500 border-red-200" },
];

function aggregateOrders(orders: OrderRow[]) {
  const byStatus: Record<string, number> = {};
  let revenue = 0;
  let paidCount = 0;
  let totalDelivery = 0;
  const salesMap = new Map<string, { quantity: number; revenue: number }>();

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status === OrderStatus.PAID) {
      revenue += Number(o.total);
      paidCount += 1;
      totalDelivery += Number(o.delivery_fee);
      for (const item of o.order_items) {
        const existing = salesMap.get(item.name);
        const itemRevenue = Number(item.price) * item.quantity;
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += itemRevenue;
        } else {
          salesMap.set(item.name, { quantity: item.quantity, revenue: itemRevenue });
        }
      }
    }
  }

  const productSales: ProductSales[] = Array.from(salesMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return { total: orders.length, revenue, avgOrderValue: paidCount > 0 ? revenue / paidCount : 0, totalDelivery, byStatus, productSales };
}

export async function OrdersOverview() {
  const [orders, usersTotal] = await Promise.all([
    getDashboardOrders(),
    getUsersCount(),
  ]);

  const stats = aggregateOrders(orders as OrderRow[]);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenue" value={formatAed(stats.revenue)} />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Orders"
          value={stats.total}
          sub={stats.avgOrderValue > 0 && <p className="font-body text-2xs text-earth/40">Avg {formatAed(stats.avgOrderValue)}</p>}
        />
        <StatCard icon={<Truck className="w-5 h-5" />} label="Delivery Total" value={formatAed(stats.totalDelivery)} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Users" value={usersTotal} />
      </section>

      <SectionHeading>Orders by Status</SectionHeading>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATUS_CONFIG.map(({ key, label, variant, icon, badgeClassName }) => (
          <Card padding="sm" key={key} className="min-[30rem]:p-6">
            <div className="flex items-center gap-2 min-[30rem]:gap-3">
              <div className="rounded-lg min-[30rem]:rounded-xl bg-sand/60 p-1.5 min-[30rem]:p-2 text-earth/40 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 min-[30rem]:[&>svg]:w-4 min-[30rem]:[&>svg]:h-4">
                {icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <Badge variant={variant} size="xs" className={cn("min-[30rem]:px-3 min-[30rem]:py-1 min-[30rem]:text-2xs", badgeClassName)}>
                  {label}
                </Badge>
                <p className="font-body font-bold text-lg min-[30rem]:text-xl text-earth">
                  {stats.byStatus[key] ?? 0}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {stats.productSales.length > 0 && (
        <>
          <SectionHeading>Product Sales</SectionHeading>
          <ProductSalesSection sales={stats.productSales} />
        </>
      )}
    </>
  );
}
