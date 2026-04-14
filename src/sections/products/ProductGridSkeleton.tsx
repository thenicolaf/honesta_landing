import { Skeleton } from "@/shared/ui";
import type { ViewMode } from "@/providers/ViewModeProvider";

function CardItem() {
  return (
    <div className="rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
      <Skeleton className="w-full aspect-3/2 rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center gap-2 pt-3 mt-auto">
          <Skeleton className="h-8 grow" />
          <Skeleton className="h-8 grow" />
        </div>
      </div>
    </div>
  );
}

function RowItem() {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white-warm border border-parchment/30 p-3 sm:p-4">
      {/* Content area — grow so footer sticks to bottom */}
      <div className="grow flow-root">
        {/* Floated image placeholder — matches AdminProductRow dimensions */}
        <div className="float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56 aspect-4/3">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Text — flow-root BFC keeps placeholders beside the image */}
        <div className="flow-root">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>

      {/* Footer placeholder — bottom-right */}
      <div className="flex justify-end mt-4">
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

type SkeletonVariant = "admin" | "public";

const GRID_CLASS: Record<SkeletonVariant, Record<ViewMode, string>> = {
  admin: {
    card: "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
    row: "grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2 xl:gap-6",
  },
  public: {
    card: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
    row: "grid grid-cols-1 gap-4 sm:gap-5 min-[1150px]:grid-cols-2 min-[1150px]:gap-6",
  },
};

export const PUBLIC_PRODUCT_GRID_CLASS = GRID_CLASS.public;

export function ProductGridSkeleton({
  mode,
  variant = "admin",
  count = 8,
}: {
  mode: ViewMode;
  variant?: SkeletonVariant;
  count?: number;
}) {
  const Item = mode === "row" ? RowItem : CardItem;
  return (
    <div className={GRID_CLASS[variant][mode]}>
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
