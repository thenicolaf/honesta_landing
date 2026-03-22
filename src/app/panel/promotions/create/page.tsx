import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { supabaseAdmin } from "@/lib/supabase.server";
import { PromotionForm } from "@/pages_flow/panel/promotions/PromotionForm";

export default async function Page() {
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
      <AdminPageHeader title="New Promotion" />
      <PromotionForm products={products} />
    </>
  );
}
