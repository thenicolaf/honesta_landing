import type { Metadata } from "next";
import { CartPage } from "@/pages_flow/cart";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected natural dried fruits before checkout.",
  robots: { index: false, follow: false },
};

export default async function CartRoute() {
  const [deliverySettings, supabase] = await Promise.all([
    getDeliverySettings(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CartPage
      deliverySettings={deliverySettings}
      isAuthenticated={!!user}
    />
  );
}
