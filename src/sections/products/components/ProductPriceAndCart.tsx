"use client";

import { Minus, Plus, ShoppingCart, PackageX } from "lucide-react";
import { Button, Badge, toastSuccess, toastInfo } from "@/shared/ui";
import { useCart } from "@/providers";
import { ProductPrice } from "./ProductPrice";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import { cn } from "@/shared/utils/cn";
import type { Product, ProductVariant } from "../types";

type Layout = "inline" | "stacked";

interface ProductPriceAndCartProps {
  product: Pick<
    Product,
    "id" | "slug" | "title" | "price" | "image_url" | "in_stock" | "promotion" | "mark"
  >;
  selectedVariant?: ProductVariant;
  /** Optional node rendered just before the primary action (e.g. a secondary icon-button). */
  actionPrefix?: React.ReactNode;
  /** Optional node rendered just after the primary action (e.g. share icon-button). */
  actionSuffix?: React.ReactNode;
  /**
   * inline (default): price and cart controls on the same row (used in detail pages).
   * stacked: price on its own row above; cart controls below at full width (used in compact cards).
   */
  layout?: Layout;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function ProductPriceAndCart({
  product,
  selectedVariant,
  actionPrefix,
  actionSuffix,
  layout = "inline",
}: ProductPriceAndCartProps) {
  const { items, addToCart, updateItemQuantity, removeFromCart } = useCart();

  const variantPrice = selectedVariant?.price;

  const variantPromotion = product.promotion && variantPrice != null
    ? {
        ...product.promotion,
        discountedPrice: calculateDiscountedPrice(
          variantPrice,
          product.promotion.discountType,
          product.promotion.discountValue,
        ),
      }
    : product.promotion;

  const effectivePrice = variantPromotion?.discountedPrice ?? variantPrice;

  const cartItem = selectedVariant
    ? items.find((i) => i.variantId === selectedVariant.id)
    : undefined;
  const quantity = cartItem?.quantity ?? 0;

  const stacked = layout === "stacked";
  const rootClass = cn(
    "mt-auto pt-1",
    stacked ? "flex flex-col gap-2" : "flex items-center justify-between gap-3",
  );
  const controlsClass = cn(
    "flex items-center gap-2",
    stacked && "w-full justify-between",
  );

  if (product.in_stock === false) {
    return (
      <div className={rootClass}>
        <ProductPrice price={variantPrice!} promotion={variantPromotion} mark={product.mark} />
        <div className={controlsClass}>
          {actionPrefix}
          <Badge
            variant="outline"
            size="md"
            className={cn(
              "h-8 font-body font-medium uppercase text-xs tracking-widest whitespace-nowrap gap-1.5",
              stacked && (actionSuffix ? "flex-1 justify-center" : "w-full justify-center"),
            )}
            aria-label="Out of Stock"
          >
            <PackageX className="w-3.5 h-3.5" />
            <span className={cn(stacked && "hidden min-[700px]:inline")}>
              Out of Stock
            </span>
          </Badge>
          {actionSuffix}
        </div>
      </div>
    );
  }

  if (variantPrice == null || product.id == null || !selectedVariant) {
    return (
      <div className={cn("mt-auto flex items-center gap-2", stacked && "w-full")}>
        {actionPrefix}
        <Button
          href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
          className="grow"
          onClick={stop}
        >
          Order via Instagram
        </Button>
        {actionSuffix}
      </div>
    );
  }

  const handleDecrement = (e: React.MouseEvent) => {
    stop(e);
    if (quantity === 1) {
      removeFromCart(selectedVariant.id);
      toastInfo("Removed from cart");
    } else {
      updateItemQuantity(selectedVariant.id, quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    stop(e);
    updateItemQuantity(selectedVariant.id, quantity + 1);
  };

  const handleAdd = (e: React.MouseEvent) => {
    stop(e);
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id!,
      slug: product.slug,
      name: product.title,
      price: effectivePrice!,
      originalPrice: variantPromotion ? variantPrice! : undefined,
      promotionEndsAt: variantPromotion ? product.promotion?.endsAt : undefined,
      image_url: product.image_url,
      weight_g: selectedVariant.weight_g,
    });
    toastSuccess("Added to cart");
  };

  if (quantity > 0) {
    return (
      <div className={rootClass}>
        <ProductPrice price={variantPrice} promotion={variantPromotion} mark={product.mark} />
        <div className={controlsClass}>
          {actionPrefix}
          <div className={cn("flex items-center gap-2", stacked && "gap-1.5")}>
            <Button
              as="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <span className="font-body font-semibold text-earth text-sm min-w-4 text-center tabular-nums">
              {quantity}
            </span>
            <Button
              as="button"
              variant="primary"
              size="icon"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {actionSuffix}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <ProductPrice price={variantPrice} promotion={variantPromotion} mark={product.mark} />
      <div className={controlsClass}>
        {actionPrefix}
        <Button
          as="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          aria-label="Add to cart"
          className={cn(
            "whitespace-nowrap gap-1.5",
            stacked && (actionSuffix ? "flex-1" : "w-full"),
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className={cn(stacked && "hidden min-[700px]:inline")}>
            Add to Cart
          </span>
        </Button>
        {actionSuffix}
      </div>
    </div>
  );
}
