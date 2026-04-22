import { Skeleton } from "@/shared/ui";

export const ADMIN_MIX_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 min-[800px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1124px]:grid-cols-3 min-[1400px]:grid-cols-4";

function MixCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white-warm border border-earth/8 overflow-hidden flex flex-col">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="flex flex-col gap-1 pt-1">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-2/3" />
        </div>
        <div className="flex gap-2 mt-auto pt-1">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function MixesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={ADMIN_MIX_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <MixCardSkeleton key={i} />
      ))}
    </div>
  );
}
