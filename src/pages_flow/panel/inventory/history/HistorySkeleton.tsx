import { Skeleton } from "@/shared/ui";

export function HistorySkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>

      <div className="xl:hidden grid grid-cols-1 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white-warm border border-parchment/30 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-4 w-14 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:block rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
        <div className="flex gap-6 px-5 py-3 border-b border-parchment/30">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-5 py-3 border-b border-parchment/15 last:border-b-0"
          >
            <Skeleton className="h-4 w-24 rounded" />
            <div className="flex items-center gap-3 w-44">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}
