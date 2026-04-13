import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { AllOrdersInner } from "@/pages_flow/panel/orders/AllOrdersPage";

const FILTER_KEYS = [
  "search",
  "status",
  "fulfilled",
  "sortKey",
  "sortDir",
  "page",
  "pageSize",
];

function OrdersSkeleton() {
  return (
    <>
      {/* Filters skeleton */}
      <div className="flex flex-col gap-3 mb-6 xl:flex-row xl:items-end">
        <Skeleton className="h-9 w-full xl:flex-1" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:contents">
          <Skeleton className="h-9 w-full xl:w-44" />
          <Skeleton className="h-9 w-full xl:w-44" />
          <Skeleton className="h-9 w-full xl:w-44" />
        </div>
      </div>

      {/* Mobile: card skeletons */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl bg-white-warm border border-parchment/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-20 mt-3" />
          </div>
        ))}
      </div>

      {/* Desktop: table skeleton */}
      <div className="hidden xl:block rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
        <div className="flex gap-6 px-5 py-3 border-b border-parchment/30">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-30 rounded" />
          <Skeleton className="h-3 w-18 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4 border-b border-parchment/15 last:border-b-0">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-30 rounded" />
            <Skeleton className="h-4 w-18 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}

async function fetchProfileMap(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { gender: string | null; birthday: string | null }>();

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, gender, birthday")
    .in("id", userIds);

  return new Map(
    (data ?? []).map((p) => [p.id, { gender: p.gender ?? null, birthday: p.birthday ?? null }]),
  );
}

async function AllOrdersContent() {
  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*), promo_code:promo_codes(code)")
    .order("created_at", { ascending: false });

  const orders = ordersData ?? [];
  const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
  const profileMap = await fetchProfileMap(userIds);

  const enrichedOrders = orders.map((o) => {
    const profile = o.user_id ? profileMap.get(o.user_id as string) : null;
    return {
      ...o,
      gender: profile?.gender ?? null,
      birthday: profile?.birthday ?? null,
    };
  });

  return <AllOrdersInner orders={enrichedOrders} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="All Orders" label="Admin Panel" />
      <SearchParamsFilterProvider keys={FILTER_KEYS}>
        <Suspense fallback={<OrdersSkeleton />}>
          <AllOrdersContent />
        </Suspense>
      </SearchParamsFilterProvider>
    </>
  );
}
