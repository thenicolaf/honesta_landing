import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { CategoryForm } from "@/pages_flow/panel/categories/CategoryForm";

export default function Page() {
  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/categories"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to categories
        </Button>
      </div>

      <AdminPageHeader title="New Category" label="Admin Panel" />
      <CategoryForm />
    </>
  );
}
