import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPage } from "@/pages_flow/cart";
import { CartSkeleton } from "@/pages_flow/cart/ui/CartSkeleton";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { getActivePromotionsMap } from "@/lib/promotionsDb";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected natural dried fruits before checkout.",
  robots: { index: false, follow: false },
};

async function CartContent() {
  const [deliverySettings, { data: { user } }, activePromotions] =
    await Promise.all([
      getDeliverySettings(),
      createSupabaseServerClient().then((s) => s.auth.getUser()),
      getActivePromotionsMap(),
    ]);

  return (
    <CartPage
      deliverySettings={deliverySettings}
      isAuthenticated={!!user}
      activePromotions={activePromotions}
    />
  );
}

export default function CartRoute() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartContent />
    </Suspense>
  );
}
