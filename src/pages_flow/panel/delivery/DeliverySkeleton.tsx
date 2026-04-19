import { Skeleton } from "@/shared/ui";

function InfoFieldSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function EmirateCardSkeleton() {
  return (
    <div className="rounded-[16px] bg-white-warm shadow-sm p-6">
      {/* Header: emirate + status (left) | Edit button (right) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      {/* 4 info fields */}
      <div className="grid grid-cols-1 gap-3">
        <InfoFieldSkeleton />
        <InfoFieldSkeleton />
        <InfoFieldSkeleton />
        <InfoFieldSkeleton />
      </div>
    </div>
  );
}

export function DeliverySkeleton({ count = 7 }: { count?: number }) {
  return (
    <>
      <div className="mb-6 rounded-xl bg-sand/50 px-4 py-3">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <EmirateCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
