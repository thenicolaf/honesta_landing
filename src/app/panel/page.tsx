import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { RefreshButton } from "@/app/panel/_components/RefreshButton";
import { SectionHeading } from "@/pages_flow/panel/dashboard/ui";
import {
  ProfitOverview,
  ProfitOverviewSkeleton,
} from "@/pages_flow/panel/dashboard/sections/ProfitOverview";
import {
  NeedsAttention,
  NeedsAttentionSkeleton,
} from "@/pages_flow/panel/dashboard/sections/NeedsAttention";
import {
  RecentNotifications,
  RecentNotificationsSkeleton,
} from "@/pages_flow/panel/dashboard/RecentNotifications";
import { MarkAllReadButton } from "@/pages_flow/panel/dashboard/MarkAllReadButton";

export default function PanelPage() {
  return (
    <>
      <AdminPageHeader title="Dashboard" actions={<RefreshButton />} />

      <Suspense fallback={<ProfitOverviewSkeleton />}>
        <ProfitOverview />
      </Suspense>

      <Suspense fallback={<NeedsAttentionSkeleton />}>
        <NeedsAttention />
      </Suspense>

      <div className="flex items-center justify-between mb-3">
        <SectionHeading className="mb-0">Recent Notifications</SectionHeading>
        <MarkAllReadButton />
      </div>
      <Suspense fallback={<RecentNotificationsSkeleton />}>
        <RecentNotifications />
      </Suspense>
    </>
  );
}
