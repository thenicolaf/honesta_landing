"use client";

import Link from "next/link";
import type { Product } from "./types";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  ProductWeight,
  ProductTags,
  ProductFreeFrom,
  ProductDetails,
  ProductPriceAndCart,
  FavoriteButton,
} from "./components";

// ─── ProductItem ──────────────────────────────────────────────────────────────

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  const {
    title,
    category,
    tagline,
    tags,
    freeFrom,
    image_url,
    weight_g,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
  } = product;

  const card = (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300">
      <ProductImage
        image_url={image_url}
        title={title}
        tagline={tagline}
        sale={!!product.promotion}
        topRight={
          product.id ? (
            <FavoriteButton
              productId={product.id}
              className="absolute top-3 right-3 z-20 bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
            />
          ) : undefined
        }
      />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader category={category} />
        <ProductTitle title={title} />
        <ProductWeight weight_g={weight_g} />
        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductDetails
          benefits={benefits}
          nutrition={nutrition}
          servingIdeas={servingIdeas}
          occasions={occasions}
        />
        <ProductPriceAndCart product={product} />
      </div>
    </div>
  );

  if (product.slug) {
    return (
      <Link href={`/products/${product.slug}`} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
