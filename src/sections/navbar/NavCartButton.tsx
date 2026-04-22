"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/shared/ui";
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
        <Badge variant="counter" size="pill" className="absolute -top-0.5 -right-0.5">
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Link>
  );
}
