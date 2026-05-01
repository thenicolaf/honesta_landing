import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Button } from "@/shared/ui";
import { MarketingPopupForm } from "@/pages_flow/panel/marketing-popup";

export default function Page() {
  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/marketing-popup"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to popups
        </Button>
      </div>

      <AdminPageHeader title="New Marketing Popup" label="Admin Panel" />
      <MarketingPopupForm popup={null} />
    </>
  );
}
