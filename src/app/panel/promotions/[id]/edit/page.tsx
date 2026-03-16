import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { supabaseAdmin } from "@/lib/supabase.server";
import { getPromotionById } from "@/lib/promotionsDb";
import { PromotionForm } from "@/pages_flow/panel/promotions/PromotionForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionById(id);
  if (!promotion) notFound();

  const { data } = await supabaseAdmin
    .from("products")
    .select("id, title, price")
    .eq("status", "published")
    .order("title");

  const products = (data ?? []).map((p) => ({
    value: p.id,
    label: p.title,
    price: Number(p.price),
  }));

  return (
    <>
      <AdminPageHeader title="Edit Promotion" />
      <PromotionForm promotion={promotion} products={products} />
    </>
  );
}
