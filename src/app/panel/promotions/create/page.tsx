import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { supabaseAdmin } from "@/lib/supabase.server";
import { PromotionForm } from "@/pages_flow/panel/promotions/PromotionForm";

export default async function Page() {
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
      <AdminPageHeader title="New Promotion" />
      <PromotionForm products={products} />
    </>
  );
}
