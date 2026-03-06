"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/providers";

export function NavCartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative p-2 text-earth hover:text-orange transition-colors duration-200"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
    >
      <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange text-white-warm font-body font-semibold flex items-center justify-center leading-none"
          style={{ fontSize: "0.5rem" }}
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
