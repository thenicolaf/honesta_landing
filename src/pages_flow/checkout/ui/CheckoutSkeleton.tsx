import { Card, Skeleton } from "@/shared/ui";

export function CheckoutSkeleton() {
  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-9 w-32 mb-4" />
        <Skeleton className="h-3 w-24 mx-auto mb-3" />
        <Skeleton className="h-10 md:h-12 w-72 mx-auto mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <CheckoutFormSkeleton />
          <CheckoutSummarySkeleton />
        </div>
      </div>
    </main>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32 mb-1" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </Card>
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-56 rounded-2xl" />
      </Card>
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <Skeleton className="h-5 w-44 mb-1" />
        <Skeleton className="h-24" />
        <Skeleton className="h-16" />
      </Card>
      <Card variant="default" padding="lg" className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-24" />
      </Card>
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}

function CheckoutSummarySkeleton() {
  return (
    <Card variant="default" padding="lg" className="lg:sticky lg:top-24">
      <Skeleton className="h-5 w-32 mb-5" />
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="grow flex flex-col gap-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="grow flex flex-col gap-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="h-px bg-earth/10 mb-4" />
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
      <div className="h-px bg-earth/10 mb-4" />
      <div className="flex justify-between mb-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-20" />
      </div>
    </Card>
  );
}
