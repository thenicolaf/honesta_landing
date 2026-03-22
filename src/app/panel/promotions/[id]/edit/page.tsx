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
    .select("id, title, product_variants(price)")
    .eq("status", "published")
    .order("title");

  const products = (data ?? []).map((p) => {
    const prices = ((p as { product_variants: { price: string }[] }).product_variants ?? [])
      .map((v) => Number(v.price));
    return {
      value: p.id,
      label: p.title,
      price: prices.length > 0 ? Math.min(...prices) : 0,
    };
  });

  return (
    <>
      <AdminPageHeader title="Edit Promotion" />
      <PromotionForm promotion={promotion} products={products} />
    </>
  );
}
