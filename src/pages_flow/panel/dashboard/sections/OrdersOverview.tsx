import {
  ShoppingBag,
  DollarSign,
  Users,
  Truck,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { Card, Badge } from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import { OrderStatus } from "@/shared/types";
import type { MixCompositionEntry } from "@/lib/orders";
import { cn } from "@/shared/utils/cn";
import { StatCard, SectionHeading } from "../ui";
import { ProductSalesSection } from "../ProductSalesSection";
import { MixSalesSection } from "../MixSalesSection";
import { getDashboardOrders, getUsersCount } from "../queries";
import type { ProductSales, MixSales, MixPresetSales } from "../types";

type OrderRow = {
  created_at: string;
  status: string;
  total: string;
  delivery_fee: string;
  order_items: {
    name: string;
    price: string;
    quantity: number;
    weight_g: number | null;
    mix_composition: MixCompositionEntry[] | null;
  }[];
};

const STATUS_CONFIG = [
  { key: OrderStatus.PAID, label: "Paid", variant: "natural" as const, icon: <CheckCircle className="w-4 h-4" /> },
  { key: OrderStatus.FAILED, label: "Failed", variant: "outline" as const, icon: <XCircle className="w-4 h-4" />, badgeClassName: "text-red-500 border-red-200" },
  { key: OrderStatus.CANCELLED, label: "Cancelled", variant: "outline" as const, icon: <Ban className="w-4 h-4" />, badgeClassName: "text-red-500 border-red-200" },
];

function aggregateOrders(orders: OrderRow[]) {
  const byStatus: Record<string, number> = {};
  let revenue = 0;
  let paidCount = 0;
  let totalDelivery = 0;
  const productMap = new Map<string, { name: string; weight_g: number; quantity: number; revenue: number }>();
  const mixMap = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
      presetMap: Map<string, MixPresetSales>;
    }
  >();

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status !== OrderStatus.PAID) continue;

    revenue += Number(o.total);
    paidCount += 1;
    totalDelivery += Number(o.delivery_fee);

    for (const item of o.order_items) {
      const itemRevenue = Number(item.price) * item.quantity;

      if (item.mix_composition) {
        let entry = mixMap.get(item.name);
        if (!entry) {
          entry = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            presetMap: new Map<string, MixPresetSales>(),
          };
          mixMap.set(item.name, entry);
        }
        entry.quantity += item.quantity;
        entry.revenue += itemRevenue;

        for (const preset of item.mix_composition) {
          const presetKey = `${preset.name}::${preset.weight_g}`;
          const presetEntry = entry.presetMap.get(presetKey);
          const totalCount = preset.count * item.quantity;
          const totalRevenue = preset.price * preset.count * item.quantity;
          if (presetEntry) {
            presetEntry.count += totalCount;
            presetEntry.revenue += totalRevenue;
          } else {
            entry.presetMap.set(presetKey, {
              name: preset.name,
              image_url: preset.image_url,
              weight_g: preset.weight_g,
              count: totalCount,
              revenue: totalRevenue,
            });
          }
        }
      } else {
        const weight = item.weight_g ?? 0;
        const key = `${item.name}::${weight}`;
        const entry = productMap.get(key);
        if (entry) {
          entry.quantity += item.quantity;
          entry.revenue += itemRevenue;
        } else {
          productMap.set(key, {
            name: item.name,
            weight_g: weight,
            quantity: item.quantity,
            revenue: itemRevenue,
          });
        }
      }
    }
  }

  const productSales: ProductSales[] = Array.from(productMap.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );
  const mixSales: MixSales[] = Array.from(mixMap.values())
    .map(({ name, quantity, revenue, presetMap }) => ({
      name,
      quantity,
      revenue,
      presets: Array.from(presetMap.values()).sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    total: orders.length,
    revenue,
    avgOrderValue: paidCount > 0 ? revenue / paidCount : 0,
    totalDelivery,
    byStatus,
    productSales,
    mixSales,
  };
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
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      {stats.mixSales.length > 0 && (
        <>
          <SectionHeading>Mix Sales</SectionHeading>
          <MixSalesSection sales={stats.mixSales} />
        </>
      )}
    </>
  );
}
