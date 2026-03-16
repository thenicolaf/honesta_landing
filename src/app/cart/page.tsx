import type { Metadata } from "next";
import { CartPage } from "@/pages_flow/cart";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected natural dried fruits before checkout.",
};

export default function CartRoute() {
  return <CartPage />;
}
