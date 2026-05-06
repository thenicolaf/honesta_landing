import { Skeleton } from "@/shared/ui";

export const ADMIN_SLOT_GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:gap-4 min-[480px]:grid-cols-2 min-[860px]:grid-cols-3 min-[1180px]:grid-cols-4 min-[1500px]:grid-cols-5";

function SlotCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white-warm border border-earth/8 p-3.5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-9 rounded-full" />
        ))}
      </div>
      <div className="flex gap-1 justify-end mt-auto pt-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export function SlotsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={ADMIN_SLOT_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <SlotCardSkeleton key={i} />
      ))}
    </div>
  );
}
