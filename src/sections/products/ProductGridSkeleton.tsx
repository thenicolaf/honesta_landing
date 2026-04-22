import { Skeleton } from "@/shared/ui";

export const PUBLIC_PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export const ADMIN_PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 min-[800px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1124px]:grid-cols-3 min-[1400px]:grid-cols-4";

// Default alias — points to the public grid.
export const PRODUCT_GRID_CLASS = PUBLIC_PRODUCT_GRID_CLASS;

type Variant = "public" | "admin";

const GRID_CLASS: Record<Variant, string> = {
  public: PUBLIC_PRODUCT_GRID_CLASS,
  admin: ADMIN_PRODUCT_GRID_CLASS,
};

function CardItem() {
  return (
    <div className="rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
      <Skeleton className="w-full aspect-3/2 rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-12 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-2/3" />
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  variant = "public",
}: {
  count?: number;
  variant?: Variant;
}) {
  return (
    <div className={GRID_CLASS[variant]}>
      {Array.from({ length: count }, (_, i) => (
        <CardItem key={i} />
      ))}
    </div>
  );
}
