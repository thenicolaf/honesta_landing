import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { PartnershipsInner } from "@/pages_flow/panel/partnerships/PartnershipsPage";

const FILTER_KEYS = [
  "search",
  "type",
  "sortKey",
  "sortDir",
  "page",
  "pageSize",
];

function PartnershipsSkeleton() {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6 xl:flex-row xl:items-end">
        <Skeleton className="h-9 w-full xl:flex-1" />
        <Skeleton className="h-9 w-full xl:w-44" />
      </div>

      {/* Mobile: cards */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl bg-white-warm border border-parchment/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-3 w-24 mt-3" />
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
        <div className="flex gap-6 px-5 py-3 border-b border-parchment/30">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4 border-b border-parchment/15 last:border-b-0">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}

async function PartnershipsContent() {
  const { data } = await supabaseAdmin
    .from("partnership_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <PartnershipsInner inquiries={data ?? []} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Partnerships" label="Admin Panel" />
      <SearchParamsFilterProvider keys={FILTER_KEYS}>
        <Suspense fallback={<PartnershipsSkeleton />}>
          <PartnershipsContent />
        </Suspense>
      </SearchParamsFilterProvider>
    </>
  );
}
