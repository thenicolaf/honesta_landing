import { Skeleton } from "@/shared/ui";

export function CartSkeleton() {
  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-8 w-40 rounded-full mb-5" />
        <Skeleton className="h-3 w-20 mx-auto mb-3" />
        <Skeleton className="h-9 w-48 mx-auto mb-10" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-white-warm border border-parchment/30 p-4 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-2xl mt-6" />
        <Skeleton className="h-12 w-full rounded-full mt-6" />
      </div>
    </main>
  );
}
