import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { PromoCodeForm } from "@/pages_flow/panel/promo-codes/PromoCodeForm";
import { loadProductOptions, loadUserOptions } from "../_data";

export default async function Page() {
  const [products, users] = await Promise.all([
    loadProductOptions(),
    loadUserOptions(),
  ]);

  return (
    <>
      <AdminPageHeader title="New Promo Code" />
      <PromoCodeForm products={products} users={users} />
    </>
  );
}
