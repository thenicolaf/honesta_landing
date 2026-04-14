import { Skeleton } from "@/shared/ui";
import type { ViewMode } from "@/providers/ViewModeProvider";

function CardItem() {
  return (
    <div className="rounded-[16px] overflow-hidden bg-white-warm border border-parchment/30">
      <Skeleton className="w-full aspect-4/3 rounded-none" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col items-start gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-3 w-16 mt-auto" />
      </div>
    </div>
  );
}

function RowItem() {
  return (
    <div className="flex flex-col h-full rounded-[16px] bg-white-warm border border-parchment/30 p-3 sm:p-4">
      {/* Content area — grow so footer sticks to bottom */}
      <div className="grow flow-root">
        {/* Floated image */}
        <div className="float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-32 sm:w-40 md:w-48 lg:w-52 xl:w-56 aspect-4/3">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Text — flow-root establishes BFC so placeholders sit next to the image, no overlap */}
        <div className="flow-root">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>

      {/* Footer — bottom-right placeholder */}
      <div className="flex justify-end mt-4">
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({
  mode,
  gridClassName,
  count = 4,
}: {
  mode: ViewMode;
  gridClassName: string;
  count?: number;
}) {
  const Item = mode === "row" ? RowItem : CardItem;
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
