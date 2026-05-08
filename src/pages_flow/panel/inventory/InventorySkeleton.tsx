import { Skeleton } from "@/shared/ui";

export function InventorySkeleton() {
  return (
    <>
      {/* Filters skeleton */}
      <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-end">
        <Skeleton className="h-9 w-full lg:flex-1" />
        <Skeleton className="h-9 w-full lg:w-44" />
      </div>

      {/* Mobile: card skeletons */}
      <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white-warm border border-parchment/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-parchment/30">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table skeleton */}
      <div className="hidden xl:block rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
        <div className="flex gap-6 px-5 py-3 border-b border-parchment/30">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-5 py-3 border-b border-parchment/15 last:border-b-0"
          >
            <div className="flex items-center gap-3 w-44">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </>
  );
}
