import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { RefreshButton } from "@/app/panel/_components/RefreshButton";
import { Skeleton, SkeletonSection } from "@/shared/ui";
import { SectionHeading } from "@/pages_flow/panel/dashboard/ui";
import { ProfitOverview } from "@/pages_flow/panel/dashboard/sections/ProfitOverview";
import { NeedsAttention } from "@/pages_flow/panel/dashboard/sections/NeedsAttention";
import { RecentNotifications } from "@/pages_flow/panel/dashboard/RecentNotifications";
import { MarkAllReadButton } from "@/pages_flow/panel/dashboard/MarkAllReadButton";

function PerformanceSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full sm:w-48" />
      </div>
      <SkeletonSection count={4} className="grid-cols-2 md:grid-cols-4" />
    </>
  );
}

export default function PanelPage() {
  return (
    <>
      <AdminPageHeader title="Dashboard" actions={<RefreshButton />} />

      <Suspense fallback={<PerformanceSkeleton />}>
        <ProfitOverview />
      </Suspense>

      <Suspense fallback={null}>
        <NeedsAttention />
      </Suspense>

      <div className="flex items-center justify-between mb-3">
        <SectionHeading className="mb-0">Recent Notifications</SectionHeading>
        <MarkAllReadButton />
      </div>
      <RecentNotifications />
    </>
  );
}
