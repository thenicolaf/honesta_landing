import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Button } from "@/shared/ui";
import { getMarketingPopupById } from "@/lib/marketingPopupDb";
import { MarketingPopupForm } from "@/pages_flow/panel/marketing-popup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const popup = await getMarketingPopupById(id);
  if (!popup) notFound();

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

      <AdminPageHeader title="Edit Marketing Popup" label="Admin Panel" />
      <MarketingPopupForm popup={popup} />
    </>
  );
}
