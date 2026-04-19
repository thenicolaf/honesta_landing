import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, ToastFromUrl, ViewModeToggle } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getMixBoxes } from "@/lib/mixBoxesDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { MixActionsProvider } from "@/pages_flow/panel/mixes/MixActionsProvider";
import { MixesPageInner } from "@/pages_flow/panel/mixes/MixesPage";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { readViewModeCookie } from "@/shared/utils/readViewModeCookie";
import { MIXES_VIEW_COOKIE } from "@/shared/consts";
import { MixesSkeleton } from "@/pages_flow/panel/mixes/MixesSkeleton";

async function MixesContent() {
  const mixes = await getMixBoxes();

  return (
    <SearchParamsFilterProvider keys={["status", "sort", "search"]}>
      <MixesPageInner mixes={mixes} />
    </SearchParamsFilterProvider>
  );
}

export default async function AdminMixesPage() {
  const initialMode = await readViewModeCookie(MIXES_VIEW_COOKIE);

  return (
    <MixActionsProvider>
      <ViewModeProvider cookieKey={MIXES_VIEW_COOKIE} initialMode={initialMode}>
        <ToastFromUrl />
        <AdminPageHeader
          title="Mixes"
          label="Admin Panel"
          actions={
            <div className="flex items-center gap-3">
              <ViewModeToggle />
              <Button
                href="/panel/mixes/create"
                variant="primary"
                size="sm"
                startIcon={<Plus size={14} aria-hidden="true" />}
              >
                New Mix
              </Button>
            </div>
          }
        />

        <Suspense fallback={<MixesSkeleton mode={initialMode} count={6} />}>
          <MixesContent />
        </Suspense>
      </ViewModeProvider>
    </MixActionsProvider>
  );
}
