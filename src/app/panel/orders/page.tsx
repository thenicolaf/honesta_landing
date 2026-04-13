import { Suspense } from "react";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { OrdersPage } from "@/pages_flow/orders/OrdersPage";

function OrdersSkeleton() {
  return (
    <>
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
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4 border-b border-parchment/15 last:border-b-0">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-30 rounded" />
            <Skeleton className="h-4 w-18 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}

async function OrdersContent() {
  const supabaseServer = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*), promo_code:promo_codes(code)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <OrdersPage orders={ordersData ?? []} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="My Orders" />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </>
  );
}
