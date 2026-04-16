import { Skeleton } from "@/shared/ui";
import type { ViewMode } from "@/providers/ViewModeProvider";

export const ADMIN_MIX_GRID_CLASS: Record<ViewMode, string> = {
  card: "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  row: "grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2 xl:gap-6",
};

function MixCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white-warm border border-earth/8 overflow-hidden flex flex-col">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-24 mt-2" />
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-parchment/50">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function MixRowSkeleton() {
  return (
    <div className="rounded-2xl bg-white-warm border border-earth/8 p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4 md:gap-5">
        <Skeleton className="shrink-0 w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56 aspect-4/3 rounded-xl" />
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-parchment/50">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function MixesSkeleton({
  mode = "row",
  count = 6,
}: {
  mode?: ViewMode;
  count?: number;
}) {
  return (
    <div className={ADMIN_MIX_GRID_CLASS[mode]}>
      {Array.from({ length: count }, (_, i) =>
        mode === "row" ? (
          <MixRowSkeleton key={i} />
        ) : (
          <MixCardSkeleton key={i} />
        ),
      )}
    </div>
  );
}
