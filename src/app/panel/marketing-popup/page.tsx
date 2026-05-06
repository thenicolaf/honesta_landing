import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getMarketingPopups } from "@/lib/marketingPopupDb";
import {
  MarketingPopupList,
  MarketingPopupsSkeleton,
} from "@/pages_flow/panel/marketing-popup";

async function MarketingPopupsContent() {
  const popups = await getMarketingPopups();
  return <MarketingPopupList popups={popups} />;
}

export default function Page() {
  return (
    <>
      <ToastFromUrl />
      <AdminPageHeader
        title="Marketing Popups"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/marketing-popup/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} />}
          >
            New Popup
          </Button>
        }
      />

      <Suspense fallback={<MarketingPopupsSkeleton count={4} />}>
        <MarketingPopupsContent />
      </Suspense>
    </>
  );
}
