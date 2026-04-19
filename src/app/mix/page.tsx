import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton, EmptyState, buttonVariants } from "@/shared/ui";
import { getActiveMixBoxes } from "@/lib/mixBoxesDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { MixBuilderPage } from "@/pages_flow/mix/MixBuilderPage";
import { HashLink } from "@/sections/navbar";

async function MixContent() {
  const boxes = await getActiveMixBoxes();

  if (boxes.length === 0) {
    return (
      <EmptyState
        label="No mixes available yet"
        description="Mix boxes are coming soon. Check back later to build your own!"
        action={{
          label: "Browse products",
          href: "/#products",
          variant: "primary",
        }}
      />
    );
  }

  return <MixBuilderPage boxes={boxes} />;
}

function MixSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <Skeleton className="h-7 w-48 mb-5" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-white-warm overflow-hidden">
              <Skeleton className="aspect-4/3 w-full" />
              <div className="p-3 sm:p-4 flex flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MixPage() {
  return (
    <main className="mx-auto grow w-full max-w-7xl px-5 sm:px-6 lg:px-10 pt-24 pb-12 md:pt-28 md:pb-20">
      <HashLink
        href="/#mix"
        className={
          buttonVariants({ variant: "outline", size: "sm" }) +
          " mb-6 inline-flex"
        }
      >
        <ArrowLeft size={14} className="mr-2" />
        Back
      </HashLink>

      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3">
        Mix Constructor
      </p>
      <h1
        className="font-display font-bold italic text-heading leading-tight mb-10"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Build Your Mix
      </h1>

      <SearchParamsFilterProvider keys={["box", "preset"]} multiKeys={["preset"]}>
        <Suspense fallback={<MixSkeleton />}>
          <MixContent />
        </Suspense>
      </SearchParamsFilterProvider>
    </main>
  );
}
