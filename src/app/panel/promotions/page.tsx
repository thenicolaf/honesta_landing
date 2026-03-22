import { getPromotions } from "@/lib/promotionsDb";
import { PromotionsPage } from "@/pages_flow/panel/promotions/PromotionsPage";

export default async function Page() {
  const promotions = await getPromotions();
  return <PromotionsPage promotions={promotions} />;
}
