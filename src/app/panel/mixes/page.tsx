import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getMixBoxes } from "@/lib/mixBoxesDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { MixActionsProvider } from "@/pages_flow/panel/mixes/MixActionsProvider";
import { MixesPageInner } from "@/pages_flow/panel/mixes/MixesPage";
import { MixesSkeleton } from "@/pages_flow/panel/mixes/MixesSkeleton";

async function MixesContent() {
  const mixes = await getMixBoxes();

  return (
    <SearchParamsFilterProvider keys={["status", "sort", "search"]}>
      <MixesPageInner mixes={mixes} />
    </SearchParamsFilterProvider>
  );
}

export default function AdminMixesPage() {
  return (
    <MixActionsProvider>
      <ToastFromUrl />
      <AdminPageHeader
        title="Mixes"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/mixes/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} aria-hidden="true" />}
          >
            New Mix
          </Button>
        }
      />

      <Suspense fallback={<MixesSkeleton count={6} />}>
        <MixesContent />
      </Suspense>
    </MixActionsProvider>
  );
}
