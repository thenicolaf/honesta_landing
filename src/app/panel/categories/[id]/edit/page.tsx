import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Skeleton } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getCategoryById } from "@/lib/categoriesDb";
import { CategoryForm } from "@/pages_flow/panel/categories/CategoryForm";

async function EditContent({ id }: { id: string }) {
  const category = await getCategoryById(id);
  if (!category) notFound();

  return <CategoryForm category={category} />;
}

function FormSkeleton() {
  return (
    <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
      <Skeleton className="h-3 w-24" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full sm:col-span-2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full sm:col-span-2" />
        <Skeleton className="h-20 w-full sm:col-span-2" />
      </div>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

      <AdminPageHeader title="Edit Category" label="Admin Panel" />

      <Suspense fallback={<FormSkeleton />}>
        <EditContent id={id} />
      </Suspense>
    </>
  );
}
