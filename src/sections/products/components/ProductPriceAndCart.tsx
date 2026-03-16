"use client";

import { Minus, Plus } from "lucide-react";
import { Button, Badge, toastSuccess, toastInfo } from "@/shared/ui";
import { useCart } from "@/providers";
import { ProductPrice } from "./ProductPrice";
import type { Product } from "../types";

interface ProductPriceAndCartProps {
  product: Pick<
    Product,
    "id" | "title" | "price" | "image_url" | "in_stock" | "promotion"
  >;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function ProductPriceAndCart({ product }: ProductPriceAndCartProps) {
  const { items, addToCart, updateItemQuantity, removeFromCart } = useCart();
  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const effectivePrice = product.promotion
    ? product.promotion.discountedPrice
    : product.price;

  if (product.in_stock === false) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <ProductPrice price={product.price!} promotion={product.promotion} />
        <Badge variant="outline" size="md">
          Out of Stock
        </Badge>
      </div>
    );
  }

  if (product.price == null || product.id == null) {
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
      removeFromCart(product.id!);
      toastInfo("Removed from cart");
    } else {
      updateItemQuantity(product.id!, quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    stop(e);
    updateItemQuantity(product.id!, quantity + 1);
  };

  const handleAdd = (e: React.MouseEvent) => {
    stop(e);
    addToCart({
      id: product.id!,
      name: product.title,
      price: effectivePrice!,
      originalPrice: product.price!,
      image_url: product.image_url,
    });
    toastSuccess("Added to cart");
  };

  if (quantity > 0) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <ProductPrice price={product.price} promotion={product.promotion} />
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
      <ProductPrice price={product.price} promotion={product.promotion} />
      <Button as="button" variant="primary" size="sm" onClick={handleAdd}>
        Add to Cart
      </Button>
    </div>
  );
}
