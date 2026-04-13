import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-parchment/40",
        className,
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl bg-white-warm border border-parchment/30 p-4 min-[30rem]:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-24 mt-2" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonSection({ label, count, className }: { label?: string; count: number; className?: string }) {
  return (
    <div className="mb-8">
      {label && <Skeleton className="h-3 w-32 mb-3" />}
      <SkeletonGrid count={count} className={className} />
    </div>
  );
}
