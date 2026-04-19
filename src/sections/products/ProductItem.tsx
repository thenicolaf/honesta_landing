"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "./types";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  ProductIngredients,
  ProductDetails,
  ProductPriceAndCart,
  ProductVariantSelector,
  ProductNote,
  FavoriteButton,
} from "./components";

// ─── ProductItem ──────────────────────────────────────────────────────────────

interface ProductItemProps {
  product: Product;
  from?: string;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function ProductItem({ product, from }: ProductItemProps) {
  const {
    title,
    category,
    tagline,
    tags,
    freeFrom,
    ingredients,
    image_url,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
  } = product;

  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants?.[0]?.id ?? "",
  );

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ??
    product.variants?.[0];

  const card = (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300">
      <ProductImage
        image_url={image_url}
        title={title}
        tagline={tagline}
        sale={!!product.promotion}
        mark={product.mark}
        topRight={
          product.id ? (
            <FavoriteButton
              productId={product.id}
              tooltipSide="left"
              className="absolute top-3 right-3 z-20 rounded-full bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
            />
          ) : undefined
        }
      />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader category={category} badge={product.badge} />
        <ProductTitle title={title} />
        {product.variants.length > 0 && (
          <div onClick={stop} className="max-w-fit">
            <ProductVariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
              size="sm"
            />
          </div>
        )}
        <ProductIngredients ingredients={ingredients} />
        <ProductNote note={product.note} />
        <ProductDetails
          benefits={benefits}
          nutrition={nutrition}
          servingIdeas={servingIdeas}
          occasions={occasions}
          tags={tags}
          freeFrom={freeFrom}
        />
        <ProductPriceAndCart
          product={product}
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );

  if (product.slug) {
    return (
      <Link href={`/products/${product.slug}${from ? `?from=${from}` : ""}`} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
