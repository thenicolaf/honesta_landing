import { getPromoCodes } from "@/lib/promoCodesDb";
import { PromoCodesPage } from "@/pages_flow/panel/promo-codes/PromoCodesPage";

export default async function Page() {
  const promoCodes = await getPromoCodes();
  return <PromoCodesPage promoCodes={promoCodes} />;
}
