import { Card, Skeleton } from "@/shared/ui";

export function MarketingPopupSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-5 w-72" />
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-end">
        <Skeleton className="h-11 w-24" />
      </div>
    </div>
  );
}
