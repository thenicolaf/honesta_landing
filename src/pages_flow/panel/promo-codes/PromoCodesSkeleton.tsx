import { Skeleton } from "@/shared/ui";

function PromoCodeCardSkeleton() {
  return (
    <div className="rounded-[16px] bg-white-warm shadow-sm p-6">
      {/* Top row: code + discount/scope (left), status badge (right) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>

      {/* Date range + usage */}
      <Skeleton className="h-3 w-3/4 mb-1" />
      <Skeleton className="h-3 w-20 mb-4" />

      {/* Actions: Edit button + delete icon */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}

export function PromoCodesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <PromoCodeCardSkeleton key={i} />
      ))}
    </div>
  );
}
