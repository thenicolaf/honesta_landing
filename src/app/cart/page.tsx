import type { Metadata } from "next";
import { CartPage } from "@/pages_flow/cart";
import { getDeliverySettings } from "@/lib/deliveryDb";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected natural dried fruits before checkout.",
};

export default async function CartRoute() {
  const deliverySettings = await getDeliverySettings();
  return <CartPage deliverySettings={deliverySettings} />;
}
