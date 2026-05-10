"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  AlertTriangle,
  Coins,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  DataTable,
  DataCardList,
  DataCardPagination,
  EmptyState,
  formatAed,
  useTableData,
  useTablePagination,
  useTableSort,
  type ColumnDef,
} from "@/shared/ui";
import { compareNumber, compareString } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import { StatCard, SectionHeading } from "../ui";
import { DateRangeSelector, useProfitRange } from "../DateRangeSelector";
import {
  resolveRangeFromMs,
  type ProfitClientData,
} from "../profitTypes";

// ── Aggregation types ────────────────────────────────────────────────

interface AggregatedProduct {
  product_id: string;
  name: string;
  image_url: string | null;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface AggregatedStats {
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  paidCount: number;
  avgOrderValue: number;
  failedCount: number;
  cancelledCount: number;
  topProducts: AggregatedProduct[];
}

function aggregate(
  data: ProfitClientData,
  fromMs: number | null,
): AggregatedStats {
  let revenue = 0;
  let cogs = 0;
  let paidCount = 0;
  let paidTotal = 0;
  let failedCount = 0;
  let cancelledCount = 0;

  for (const o of data.orders) {
    if (fromMs !== null && o.changed_at < fromMs) continue;
    if (o.status === "PAID") {
      paidCount += 1;
      paidTotal += o.total;
    } else if (o.status === "FAILED") {
      failedCount += 1;
    } else if (o.status === "CANCELLED") {
      cancelledCount += 1;
    }
  }

  const productAgg = new Map<
    string,
    { name: string; image_url: string | null; revenue: number; cost: number }
  >();

  for (const row of data.rows) {
    if (fromMs !== null && row.paid_at < fromMs) continue;

    const netUnitPrice = row.price - row.promo_discount;
    const itemRevenue = netUnitPrice * row.quantity;
    revenue += itemRevenue;

    if (row.mix_composition && row.mix_composition.length > 0) {
      // Apportion the (price - promo_discount) discount uniformly across cells
      // so per-product attribution sums back to the line revenue.
      const cellShareRatio = row.price > 0 ? netUnitPrice / row.price : 1;

      for (const entry of row.mix_composition) {
        if (!entry.product_id) continue;
        const costPer100g = data.costs[entry.product_id] ?? 0;
        const costShare =
          (costPer100g / 100) * entry.weight_g * entry.count * row.quantity;
        const revenueShare =
          entry.price * entry.count * row.quantity * cellShareRatio;
        cogs += costShare;

        const existing = productAgg.get(entry.product_id);
        if (existing) {
          existing.revenue += revenueShare;
          existing.cost += costShare;
        } else {
          productAgg.set(entry.product_id, {
            name: entry.name,
            image_url: entry.image_url,
            revenue: revenueShare,
            cost: costShare,
          });
        }
      }
    } else if (row.product_id) {
      const costPer100g = data.costs[row.product_id] ?? 0;
      const itemCost = (costPer100g / 100) * row.weight_g * row.quantity;
      cogs += itemCost;

      const existing = productAgg.get(row.product_id);
      if (existing) {
        existing.revenue += itemRevenue;
        existing.cost += itemCost;
      } else {
        productAgg.set(row.product_id, {
          name: row.product_name ?? "—",
          image_url: row.product_image_url,
          revenue: itemRevenue,
          cost: itemCost,
        });
      }
    }
  }

  const profit = revenue - cogs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const avgOrderValue = paidCount > 0 ? paidTotal / paidCount : 0;

  const topProducts: AggregatedProduct[] = Array.from(productAgg.entries())
    .map(([product_id, agg]) => {
      const productProfit = agg.revenue - agg.cost;
      return {
        product_id,
        name: agg.name,
        image_url: agg.image_url,
        revenue: agg.revenue,
        cost: agg.cost,
        profit: productProfit,
        margin: agg.revenue > 0 ? (productProfit / agg.revenue) * 100 : 0,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  return {
    revenue,
    cogs,
    profit,
    margin,
    paidCount,
    avgOrderValue,
    failedCount,
    cancelledCount,
    topProducts,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function marginTone(margin: number) {
  if (margin >= 30) return "text-moss";
  if (margin >= 10) return "text-orange";
  return "text-red-600";
}

function marginLabel(margin: number) {
  if (margin >= 30) return "Healthy";
  if (margin >= 10) return "Watch";
  return "Low";
}

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0%";
  return `${value.toFixed(1)}%`;
}

// ── Columns (desktop table) ─────────────────────────────────────────

type ProductKey = "product" | "revenue" | "cost" | "profit" | "margin";

const productColumn: ColumnDef<AggregatedProduct, ProductKey> = {
  key: "product",
  header: "Product",
  cell: (p) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : null}
      </div>
      <span className="font-semibold text-sm text-earth capitalize wrap-break-word">
        {p.name}
      </span>
    </div>
  ),
  sortable: true,
  compare: compareString((p) => p.name),
  headerClassName: "min-w-56",
};

const revenueColumn: ColumnDef<AggregatedProduct, ProductKey> = {
  key: "revenue",
  header: "Revenue",
  cell: (p) => (
    <span className="text-sm tabular-nums text-earth whitespace-nowrap">
      {formatAed(p.revenue)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((p) => p.revenue),
  headerClassName: "min-w-28",
};

const costColumn: ColumnDef<AggregatedProduct, ProductKey> = {
  key: "cost",
  header: "Cost",
  cell: (p) => (
    <span className="text-sm tabular-nums text-earth/65 whitespace-nowrap">
      {formatAed(p.cost)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((p) => p.cost),
  headerClassName: "min-w-28",
};

const profitColumn: ColumnDef<AggregatedProduct, ProductKey> = {
  key: "profit",
  header: "Profit",
  cell: (p) => (
    <span className="font-semibold text-sm tabular-nums text-earth whitespace-nowrap">
      {formatAed(p.profit)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((p) => p.profit),
  headerClassName: "min-w-28",
};

const marginColumn: ColumnDef<AggregatedProduct, ProductKey> = {
  key: "margin",
  header: "Margin",
  cell: (p) => (
    <span
      className={cn(
        "text-sm tabular-nums whitespace-nowrap",
        marginTone(p.margin),
      )}
    >
      {formatPercent(p.margin)}
    </span>
  ),
  sortable: true,
  compare: compareNumber((p) => p.margin),
  headerClassName: "min-w-24",
};

const productColumns: ColumnDef<AggregatedProduct, ProductKey>[] = [
  productColumn,
  revenueColumn,
  costColumn,
  profitColumn,
  marginColumn,
];

// ── Mobile card ─────────────────────────────────────────────────────

function ProductCard({ product }: { product: AggregatedProduct }) {
  return (
    <Card padding="none" className="px-3 py-2.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-earth capitalize wrap-break-word">
            {product.name}
          </p>
          <p className="text-2xs text-earth/55 tabular-nums wrap-break-word">
            <span>{formatAed(product.revenue)}</span>
            <span className="text-earth/30"> · </span>
            <span>Cost {formatAed(product.cost)}</span>
            <span className="text-earth/30"> · </span>
            <span className={marginTone(product.margin)}>
              {formatPercent(product.margin)}
            </span>
          </p>
        </div>
        <span className="font-semibold text-sm text-earth tabular-nums shrink-0">
          {formatAed(product.profit)}
        </span>
      </div>
    </Card>
  );
}

// ── Inner ───────────────────────────────────────────────────────────

export function ProfitOverviewInner({ data }: { data: ProfitClientData }) {
  const range = useProfitRange();

  const stats = useMemo(() => {
    const fromMs = resolveRangeFromMs(range);
    return aggregate(data, fromMs);
  }, [data, range]);

  const { sort, onSort } = useTableSort<ProductKey>();
  const sorted = useTableData(stats.topProducts, productColumns, sort);
  const { paginatedData, pagination } = useTablePagination(sorted, 10);

  const issues = stats.failedCount + stats.cancelledCount;

  return (
    <>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading className="mb-0">Performance</SectionHeading>
        <DateRangeSelector />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Coins className="w-5 h-5" />}
          label="Revenue"
          value={formatAed(stats.revenue)}
        />
        <StatCard
          icon={
            stats.profit >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          label="Profit"
          value={formatAed(stats.profit)}
          sub={
            <p
              className={cn(
                "font-body text-2xs tabular-nums",
                marginTone(stats.margin),
              )}
            >
              {formatPercent(stats.margin)} margin · {marginLabel(stats.margin)}
            </p>
          }
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Orders"
          value={stats.paidCount}
          sub={
            stats.avgOrderValue > 0 ? (
              <p className="font-body text-2xs tabular-nums text-earth/40">
                Avg {formatAed(stats.avgOrderValue)}
              </p>
            ) : null
          }
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Issues"
          value={issues}
          sub={
            issues > 0 ? (
              <p className="font-body text-2xs tabular-nums text-red-600">
                {stats.failedCount} failed · {stats.cancelledCount} cancelled
              </p>
            ) : (
              <p className="font-body text-2xs tabular-nums text-moss">
                All clear
              </p>
            )
          }
        />
      </section>

      <SectionHeading>Top sellers</SectionHeading>
      {stats.topProducts.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-10 h-10 text-earth/15" />}
          label="No sales yet"
          description="Once paid orders are placed in the selected period, top products will appear here."
        />
      ) : (
        <div className="mb-8">
          {/* Mobile: cards */}
          <div className="xl:hidden">
            <DataCardList>
              {paginatedData.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </DataCardList>
            <DataCardPagination pagination={pagination} />
          </div>

          {/* Desktop: table */}
          <div className="hidden xl:block">
            <DataTable
              data={paginatedData}
              columns={productColumns}
              keyExtractor={(p) => p.product_id}
              sort={sort}
              onSort={onSort}
              pagination={pagination}
              wrapperClassName="overscroll-auto!"
              emptyIcon={<TrendingUp className="w-10 h-10 text-earth/15" />}
              emptyLabel="No sales"
              emptyDescription="No paid orders in the selected period."
            />
          </div>
        </div>
      )}
    </>
  );
}
