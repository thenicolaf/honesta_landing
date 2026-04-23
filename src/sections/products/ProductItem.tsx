"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "./types";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  IngredientsInline,
  ProductPriceAndCart,
  ProductVariantSelector,
  NoteButton,
  ViewButton,
  FavoriteButton,
  ShareButton,
} from "./components";

interface ProductItemProps {
  product: Product;
  from?: string;
}

export function ProductItem({ product, from }: ProductItemProps) {
  const { title, category, ingredients, image_url } = product;

  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants?.[0]?.id ?? "",
  );

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ??
    product.variants?.[0];

  const href = product.slug
    ? `/products/${product.slug}${from ? `?from=${from}` : ""}`
    : undefined;

  return (
    <div className="relative z-0 has-[[role=tooltip]]:z-10 h-full flex flex-col rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-[box-shadow,border-color] duration-300">
      <div className="relative">
        {href ? (
          <Link href={href} className="block" aria-label={title}>
            <ProductImage
              image_url={image_url}
              title={title}
              sale={!!product.promotion}
              mark={product.mark}
              topRight={
                product.id ? (
                  <FavoriteButton
                    productId={product.id}
                    tooltipSide="left"
                    className="absolute top-2 right-2 z-20 rounded-full bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
                  />
                ) : undefined
              }
            />
          </Link>
        ) : (
          <ProductImage
            image_url={image_url}
            title={title}
            sale={!!product.promotion}
            mark={product.mark}
            topRight={
              product.id ? (
                <FavoriteButton
                  productId={product.id}
                  tooltipSide="left"
                  className="absolute top-2 right-2 z-20 rounded-full bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
                />
              ) : undefined
            }
          />
        )}
        {href && <ViewButton href={href} />}
        <NoteButton note={product.note} />
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <ProductHeader category={category} badge={product.badge} />
        <ProductTitle title={title} />
        {product.variants.length > 0 && (
          <ProductVariantSelector
            variants={product.variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
            size="sm"
          />
        )}
        <IngredientsInline ingredients={ingredients} />
        <ProductPriceAndCart
          product={product}
          selectedVariant={selectedVariant}
          layout="stacked"
          actionSuffix={
            product.slug ? (
              <ShareButton
                title={title}
                slug={product.slug}
                align="right"
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
