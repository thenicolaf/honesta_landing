"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "./types";
import { buildProductHref } from "./utils";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  IngredientsInline,
  ProductPriceAndCart,
  ProductVariantSelector,
  NoteButton,
  VideoButton,
  ViewButton,
  FavoriteButton,
  ShareButton,
} from "./components";

interface ProductItemProps {
  product: Product;
  from?: string;
  /** Full back URL (path + query + hash) — overrides the static `FROM_MAP[from].href` so filter state is preserved. */
  backHref?: string;
}

export function ProductItem({ product, from, backHref }: ProductItemProps) {
  const { title, category, ingredients, image_url } = product;

  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants?.[0]?.id ?? "",
  );

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ??
    product.variants?.[0];

  const href = buildProductHref({ slug: product.slug, from, backHref });

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300">
      <div className="relative">
        {href ? (
          <Link href={href} className="block" aria-label={title}>
            <ProductImage
              image_url={image_url}
              title={title}
              sale={!!product.promotion}
              mark={product.mark}
            />
          </Link>
        ) : (
          <ProductImage
            image_url={image_url}
            title={title}
            sale={!!product.promotion}
            mark={product.mark}
          />
        )}
        {product.id && (
          <FavoriteButton
            product={product as typeof product & { id: string }}
            tooltipSide="left"
            className="absolute top-2 right-2 z-30 rounded-full bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
          />
        )}
        {href && <ViewButton href={href} />}
        {(product.note || product.video_url) && (
          <div className="absolute bottom-2 right-2 z-30 flex flex-col-reverse gap-1.5">
            {product.note && <NoteButton note={product.note} />}
            {product.video_url && (
              <VideoButton video_url={product.video_url} title={title} />
            )}
          </div>
        )}
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
