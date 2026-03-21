import {
  ShoppingBag,
  DollarSign,
  Users,
  Handshake,
  Package,
  LayoutGrid,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  Archive,
  Truck,
  Tag,
} from "lucide-react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { RefreshButton } from "@/app/panel/_components/RefreshButton";
import { Card, Badge } from "@/shared/ui";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { OrderStatus } from "@/shared/types";
import type { DashboardStats } from "./types";
import { cn } from "@/shared/utils/cn";
import { RecentNotifications } from "./RecentNotifications";
import { ProductSalesSection } from "./ProductSalesSection";

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card padding="sm" className={cn("min-[30rem]:p-6", className)}>
      <div className="flex items-start justify-between gap-2 min-[30rem]:gap-3">
        <div className="flex flex-col gap-0.5 min-[30rem]:gap-1 min-w-0">
          <p className="font-body font-semibold uppercase tracking-[0.12em] text-xs min-[30rem]:text-2xs text-earth/50 truncate">
            {label}
          </p>
          <p className="font-body font-bold text-base min-[30rem]:text-2xl text-earth leading-tight truncate">
            {value}
          </p>
          {sub && <div className="mt-0.5 min-[30rem]:mt-1">{sub}</div>}
        </div>
        <div className="rounded-lg min-[30rem]:rounded-xl bg-sand/60 p-1.5 min-[30rem]:p-2.5 text-earth/40 shrink-0 [&>svg]:w-4 [&>svg]:h-4 min-[30rem]:[&>svg]:w-5 min-[30rem]:[&>svg]:h-5">
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Section Heading ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/40 mb-3">
      {children}
    </h3>
  );
}

// ─── Order Status Row ───────────────────────────────────────────────────────

const STATUS_CONFIG = [
  {
    key: OrderStatus.PAID,
    label: "Paid",
    variant: "natural" as const,
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    key: OrderStatus.PENDING,
    label: "Pending",
    variant: "warm" as const,
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: OrderStatus.FAILED,
    label: "Failed",
    variant: "outline" as const,
    icon: <XCircle className="w-4 h-4" />,
    badgeClassName: "text-red-500 border-red-200",
  },
  {
    key: OrderStatus.CANCELLED,
    label: "Cancelled",
    variant: "outline" as const,
    icon: <Ban className="w-4 h-4" />,
    badgeClassName: "text-red-500 border-red-200",
  },
];

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export function DashboardPage({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <AdminPageHeader title="Dashboard" actions={<RefreshButton />} />

      {/* ── Overview ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Revenue"
          value={formatAed(stats.orders.revenue)}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Orders"
          value={stats.orders.total}
          sub={
            stats.orders.avgOrderValue > 0 && (
              <p className="font-body text-2xs text-earth/40">
                Avg {formatAed(stats.orders.avgOrderValue)}
              </p>
            )
          }
        />
        <StatCard
          icon={<Truck className="w-5 h-5" />}
          label="Delivery Total"
          value={formatAed(stats.orders.totalDelivery)}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Users"
          value={stats.users.total}
        />
      </section>

      {/* ── Orders by Status ─────────────────────────────────────────── */}
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
                  {stats.orders.byStatus[key] ?? 0}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* ── Product Sales ────────────────────────────────────────────── */}
      {stats.orders.productSales.length > 0 && (
        <>
          <SectionHeading>Product Sales</SectionHeading>
          <ProductSalesSection sales={stats.orders.productSales} />
        </>
      )}

      {/* ── Catalog ──────────────────────────────────────────────────── */}
      <SectionHeading>Catalog</SectionHeading>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Published"
          value={stats.products.published}
          sub={
            <p className="font-body text-2xs text-earth/40">
              of {stats.products.total} total
            </p>
          }
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Draft"
          value={stats.products.draft}
        />
        <StatCard
          icon={<LayoutGrid className="w-5 h-5" />}
          label="Categories"
          value={stats.categories.total}
        />
        <StatCard
          icon={<Archive className="w-5 h-5" />}
          label="Archived"
          value={stats.products.archived}
          className={
            stats.products.archived > 0 ? "border-earth/20" : undefined
          }
        />
        {stats.products.outOfStock > 0 && (
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Out of Stock"
            value={stats.products.outOfStock}
            className="border-red-200"
          />
        )}
      </section>

      {/* ── Partnerships ─────────────────────────────────────────────── */}
      <SectionHeading>Partnerships</SectionHeading>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Handshake className="w-5 h-5" />}
          label="Inquiries"
          value={stats.partnerships.total}
        />
      </section>

      {/* ── Active Promotions ────────────────────────────────────────── */}
      {stats.activePromotions.length > 0 && (
        <>
          <SectionHeading>Active Promotions</SectionHeading>
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {stats.activePromotions.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-orange/8 p-2.5 text-orange shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-earth">
                        {p.name}
                      </p>
                      <p className="font-body text-2xs text-earth/50 mt-0.5">
                        {p.discount_type === "percentage"
                          ? `${p.discount_value}% off`
                          : `AED ${p.discount_value} off`}
                        {" · "}
                        {p.product_count} product{p.product_count !== 1 ? "s" : ""}
                      </p>
                      <p className="font-body text-xs text-earth/30 mt-1">
                        Ends {formatDateTime(p.ends_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="natural" size="xs">Active</Badge>
                </div>
              </Card>
            ))}
          </section>
        </>
      )}

      {/* ── Recent Notifications ──────────────────────────────────────── */}
      <SectionHeading>Recent Notifications</SectionHeading>
      <RecentNotifications />
    </>
  );
}
