import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { Card, Skeleton } from "@/shared/ui";
import { getProfitClientData } from "../profitQueries";
import { ProfitOverviewInner } from "./ProfitOverviewInner";

const FILTER_KEYS = ["range"];

export async function ProfitOverview() {
  const data = await getProfitClientData();

  return (
    <SearchParamsFilterProvider keys={FILTER_KEYS}>
      <ProfitOverviewInner data={data} />
    </SearchParamsFilterProvider>
  );
}

function StatCardSkeleton() {
  return (
    <Card padding="sm" className="min-[30rem]:p-6">
      <div className="flex items-start justify-between gap-2 min-[30rem]:gap-3">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      </div>
    </Card>
  );
}

function TopSellerRowSkeleton() {
  return (
    <Card padding="none" className="px-3 py-2.5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
    </Card>
  );
}

export function ProfitOverviewSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full sm:w-48" />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      <Skeleton className="h-3 w-24 mb-3" />
      <div className="mb-8 grid grid-cols-1 gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <TopSellerRowSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
