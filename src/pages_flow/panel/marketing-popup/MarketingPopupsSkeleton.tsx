import { Card, Skeleton } from "@/shared/ui";

interface MarketingPopupsSkeletonProps {
  count?: number;
}

export function MarketingPopupsSkeleton({
  count = 4,
}: MarketingPopupsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48 mb-4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="ml-auto h-8 w-8" />
          </div>
        </Card>
      ))}
    </div>
  );
}
