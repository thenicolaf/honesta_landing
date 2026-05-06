import { Skeleton, SkeletonProductCard } from "@/shared/ui/Skeleton";

export function PromoSliderSkeleton() {
  return (
    <section className="bg-cream py-20 md:py-28 noise relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 text-center">
          <Skeleton className="h-3 w-28 mx-auto mb-4" />
          <Skeleton className="h-8 w-72 mx-auto" />
        </div>
        <div className="overflow-hidden">
          <div className="flex -ml-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="pl-4 min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <SkeletonProductCard />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
