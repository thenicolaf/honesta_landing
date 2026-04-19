import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Skeleton } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getMixFormOptions } from "@/lib/mixBoxesDb";
import { MixForm } from "@/pages_flow/panel/mixes/MixForm";

async function CreateContent() {
  const options = await getMixFormOptions();
  return <MixForm options={options} />;
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4"
        >
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/mixes"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to mixes
        </Button>
      </div>

      <AdminPageHeader title="New Mix" label="Admin Panel" />

      <Suspense fallback={<FormSkeleton />}>
        <CreateContent />
      </Suspense>
    </>
  );
}
