import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getPromoCodeById } from "@/lib/promoCodesDb";
import { PromoCodeForm } from "@/pages_flow/panel/promo-codes/PromoCodeForm";
import { loadProductOptions, loadUserOptions } from "../../_data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promoCode = await getPromoCodeById(id);
  if (!promoCode) notFound();

  const [products, users] = await Promise.all([
    loadProductOptions(),
    loadUserOptions(),
  ]);

  return (
    <>
      <AdminPageHeader title="Edit Promo Code" />
      <PromoCodeForm promoCode={promoCode} products={products} users={users} />
    </>
  );
}
