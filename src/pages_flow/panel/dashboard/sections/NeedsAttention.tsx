import Link from "next/link";
import { ArrowRight, Package, Truck } from "lucide-react";
import { Card, Skeleton } from "@/shared/ui";
import { supabaseAdmin } from "@/lib/supabase.server";
import { getInventoryRows } from "@/lib/inventoryDb";
import { OrderStatus } from "@/shared/types";
import { SectionHeading } from "../ui";

async function getLowStockCount(): Promise<number> {
  const rows = await getInventoryRows();
  return rows.filter((r) => r.status === "low" || r.status === "out").length;
}

async function getUnfulfilledPaidCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", OrderStatus.PAID)
    .eq("is_fulfilled", false);
  return count ?? 0;
}

interface AttentionItem {
  label: string;
  count: number;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function AttentionCard({ item }: { item: AttentionItem }) {
  return (
    <Link
      href={item.href}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
    >
      <Card
        padding="sm"
        className="min-[30rem]:p-6 transition-shadow group-hover:shadow-md"
      >
        <div className="flex items-start gap-3 min-[30rem]:gap-4">
          <div className="rounded-lg min-[30rem]:rounded-xl bg-orange/10 p-2 min-[30rem]:p-2.5 text-orange shrink-0 [&>svg]:w-4 [&>svg]:h-4 min-[30rem]:[&>svg]:w-5 min-[30rem]:[&>svg]:h-5">
            {item.icon}
          </div>
          <div className="flex flex-col gap-0.5 min-[30rem]:gap-1 min-w-0 flex-1">
            <p className="font-body font-semibold uppercase tracking-[0.12em] text-xs min-[30rem]:text-2xs text-earth/50">
              {item.label}
            </p>
            <p className="font-body font-bold text-2xl min-[30rem]:text-3xl text-earth leading-tight">
              {item.count}
            </p>
            <p className="font-body text-2xs text-earth/55 mt-0.5 min-[30rem]:mt-1">
              {item.description}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-earth/30 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-earth/60" />
        </div>
      </Card>
    </Link>
  );
}

export async function NeedsAttention() {
  const [lowStock, unfulfilled] = await Promise.all([
    getLowStockCount(),
    getUnfulfilledPaidCount(),
  ]);

  if (lowStock === 0 && unfulfilled === 0) return null;

  const items: AttentionItem[] = [];
  if (unfulfilled > 0) {
    items.push({
      label: "Orders to fulfill",
      count: unfulfilled,
      description: "Paid orders awaiting fulfillment",
      href: "/panel/all-orders?status=PAID&fulfilled=no",
      icon: <Truck />,
    });
  }
  if (lowStock > 0) {
    items.push({
      label: "Low stock",
      count: lowStock,
      description: "Products at or below threshold",
      href: "/panel/inventory?status=low",
      icon: <Package />,
    });
  }

  return (
    <>
      <SectionHeading>Needs attention</SectionHeading>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {items.map((item) => (
          <AttentionCard key={item.label} item={item} />
        ))}
      </section>
    </>
  );
}

export function NeedsAttentionSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-32 mb-3" />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} padding="sm" className="min-[30rem]:p-6">
            <div className="flex items-start gap-3 min-[30rem]:gap-4">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0" />
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
