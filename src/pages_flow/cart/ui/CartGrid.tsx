"use client";

import { useCart } from "@/providers";
import { getPerItemPromoDiscounts } from "@/shared/utils/recalculatePromoDiscount";
import { CartItem } from "./CartItem";

export function CartGrid() {
  const { items, appliedPromoCode, updateItemQuantity, removeFromCart } =
    useCart();

  const perItemPromoDiscounts = getPerItemPromoDiscounts(
    items,
    appliedPromoCode,
  );

  return (
    <div className="flex flex-col gap-3 mb-6">
      {items.map((item) => (
        <CartItem
          key={item.variantId}
          item={item}
          promoDiscountPerUnit={perItemPromoDiscounts.get(item.variantId) ?? 0}
          promoCodeEndsAt={appliedPromoCode?.endsAt}
          onUpdateQuantity={updateItemQuantity}
          onRemove={removeFromCart}
        />
      ))}
    </div>
  );
}
