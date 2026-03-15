import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/categoriesDb";
import { EditCategoryPage } from "@/pages_flow/panel/categories/EditCategoryPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) notFound();

  return <EditCategoryPage category={category} />;
}
