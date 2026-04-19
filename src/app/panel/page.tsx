import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { RefreshButton } from "@/app/panel/_components/RefreshButton";
import { SkeletonSection } from "@/shared/ui";
import { SectionHeading } from "@/pages_flow/panel/dashboard/ui";
import { OrdersOverview } from "@/pages_flow/panel/dashboard/sections/OrdersOverview";
import { CatalogOverview } from "@/pages_flow/panel/dashboard/sections/CatalogOverview";
import { PartnershipsOverview } from "@/pages_flow/panel/dashboard/sections/PartnershipsOverview";
import { PromotionsOverview } from "@/pages_flow/panel/dashboard/sections/PromotionsOverview";
import { RecentNotifications } from "@/pages_flow/panel/dashboard/RecentNotifications";
import { MarkAllReadButton } from "@/pages_flow/panel/dashboard/MarkAllReadButton";

function OrdersSkeleton() {
  return (
    <>
      <SkeletonSection count={4} className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />
      <SkeletonSection count={4} label="Orders by Status" className="grid-cols-2 md:grid-cols-4" />
      <SkeletonSection count={3} label="Product Sales" className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
    </>
  );
}

export default function PanelPage() {
  return (
    <>
      <AdminPageHeader title="Dashboard" actions={<RefreshButton />} />

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersOverview />
      </Suspense>

      <Suspense fallback={<SkeletonSection count={4} label="Catalog" className="grid-cols-2 md:grid-cols-4" />}>
        <CatalogOverview />
      </Suspense>

      <Suspense fallback={<SkeletonSection count={1} label="Partnerships" className="grid-cols-2 md:grid-cols-4" />}>
        <PartnershipsOverview />
      </Suspense>

      <Suspense fallback={<SkeletonSection count={3} label="Active Promotions" className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />}>
        <PromotionsOverview />
      </Suspense>

      <div className="flex items-center justify-between mb-3">
        <SectionHeading className="mb-0">Recent Notifications</SectionHeading>
        <MarkAllReadButton />
      </div>
      <RecentNotifications />
    </>
  );
}
