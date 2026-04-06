"use client";

import { Minus, Plus } from "lucide-react";
import { Button, Badge, toastSuccess, toastInfo } from "@/shared/ui";
import { useCart } from "@/providers";
import { ProductPrice } from "./ProductPrice";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import type { Product, ProductVariant } from "../types";

interface ProductPriceAndCartProps {
  product: Pick<
    Product,
    "id" | "slug" | "title" | "price" | "image_url" | "in_stock" | "promotion" | "mark"
  >;
  selectedVariant?: ProductVariant;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function ProductPriceAndCart({ product, selectedVariant }: ProductPriceAndCartProps) {
  const { items, addToCart, updateItemQuantity, removeFromCart } = useCart();

  const variantPrice = selectedVariant?.price;

  // Compute promotion for selected variant's price
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

  if (product.in_stock === false) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <ProductPrice price={variantPrice!} promotion={variantPromotion} mark={product.mark} />
        <Badge variant="outline" size="md">
          Out of Stock
        </Badge>
      </div>
    );
  }

  if (variantPrice == null || product.id == null || !selectedVariant) {
    return (
      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="sm"
        className="mt-auto w-full"
        onClick={stop}
      >
        Order via Instagram
      </Button>
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
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <ProductPrice price={variantPrice} promotion={variantPromotion} mark={product.mark} />
        <div className="flex items-center gap-2">
          <Button
            as="button"
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="font-body font-semibold text-earth text-sm w-4 text-center">
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
      </div>
    );
  }

  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
      <ProductPrice price={variantPrice} promotion={variantPromotion} mark={product.mark} />
      <Button as="button" variant="primary" size="sm" onClick={handleAdd}>
        Add to Cart
      </Button>
    </div>
  );
}
