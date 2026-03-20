"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui";
import type { Product } from "@/sections/products/types";
import {
  ProductHeader,
  ProductTags,
  ProductFreeFrom,
  ProductPriceAndCart,
  ProductExpandedDetails,
  ProductDetailImage,
  ProductTagline,
  ProductVariantSelector,
  FavoriteButton,
} from "@/sections/products/components";

// ─── ProductDetailPage ────────────────────────────────────────────────────────

interface ProductDetailPageProps {
  product: Product;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const {
    title,
    category,
    tagline,
    tags,
    freeFrom,
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

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Back link */}
        <Button
          as="a"
          href="/#products"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
          className="mb-5"
        >
          Back to products
        </Button>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          <ProductDetailImage image_url={image_url} images={product.images} title={title} />

          {/* Content column */}
          <div className="flex flex-col gap-5">
            <ProductHeader
              category={category}
              extraBadges={
                product.id && <FavoriteButton productId={product.id} />
              }
            />

            <h1
              className="font-display font-semibold text-heading leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
            >
              {title}
            </h1>

            <ProductTagline tagline={tagline} />

            {product.variants.length > 0 && (
              <ProductVariantSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            )}

            <ProductPriceAndCart product={product} selectedVariant={selectedVariant} />

            <ProductTags tags={tags} />
            <ProductFreeFrom freeFrom={freeFrom} />

            <ProductExpandedDetails
              benefits={benefits}
              nutrition={nutrition}
              servingIdeas={servingIdeas}
              occasions={occasions}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
