"use client";

import { useCart } from "@/providers";
import { CartItem } from "./CartItem";

export function CartGrid() {
  const { items, updateItemQuantity, removeFromCart } = useCart();

  return (
    <div className="flex flex-col gap-3 mb-6">
      {items.map((item) => (
        <CartItem
          key={item.variantId}
          item={item}
          onUpdateQuantity={updateItemQuantity}
          onRemove={removeFromCart}
        />
      ))}
    </div>
  );
}
