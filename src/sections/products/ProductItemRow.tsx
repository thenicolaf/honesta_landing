"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Badge,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import type { Product } from "./types";
import {
  ProductHeader,
  ProductTitle,
  ProductTags,
  ProductIngredients,
  ProductFreeFrom,
  ProductNote,
  ProductPriceAndCart,
  ProductVariantSelector,
  FavoriteButton,
  BenefitsList,
  NutritionTable,
  ServingIdeas,
  ProductOccasions,
  hasDetailsContent,
} from "./components";

interface ProductItemRowProps {
  product: Product;
  from?: string;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function ProductItemRow({ product, from }: ProductItemRowProps) {
  const {
    title,
    category,
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

  const sale = !!product.promotion;
  const mark = product.mark;
  const hasDetails = hasDetailsContent({
    benefits,
    nutrition,
    servingIdeas,
    occasions,
  });

  const card = (
    <Collapsible className="flex flex-col h-full rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300 p-3 sm:p-4">
      {/* Content area — children flow around the floated image; long text wraps under it. */}
      <div className="grow flow-root space-y-3">
        {/* Floated image — same dimensions as AdminProductRow */}
        <div className="relative float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56 aspect-4/3 rounded-xl overflow-hidden bg-sand">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, (max-width: 1024px) 240px, (max-width: 1280px) 256px, (max-width: 1536px) 208px, 224px"
            />
          ) : null}

          {(sale || (mark && mark !== "standard")) && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 flex flex-wrap gap-1">
              {sale && (
                <Badge
                  variant="counter"
                  size="xs"
                  className="sm:px-3! sm:py-1! sm:text-2xs!"
                >
                  SALE
                </Badge>
              )}
              {mark === "best_seller" && (
                <Badge
                  variant="counter"
                  size="xs"
                  className="bg-red-700! sm:px-3! sm:py-1! sm:text-2xs!"
                >
                  BEST SELLER
                </Badge>
              )}
              {mark === "new" && (
                <Badge
                  variant="counter"
                  size="xs"
                  className="bg-moss! sm:px-3! sm:py-1! sm:text-2xs!"
                >
                  NEW
                </Badge>
              )}
            </div>
          )}

          {product.id && (
            <FavoriteButton
              productId={product.id}
              tooltipSide="left"
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 rounded-full bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm"
            />
          )}
        </div>

        {/* category → title → badge */}
        <ProductHeader category={category} />
        <ProductTitle title={title} />
        {product.badge && (
          <div className="-translate-x-2">
            <Badge variant="natural">{product.badge}</Badge>
          </div>
        )}

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

        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductIngredients ingredients={ingredients} />
        <ProductNote note={product.note} />
      </div>

      {/* Details content — appears above price when expanded; clear-both places it below the floated image */}
      {hasDetails && (
        <CollapsibleContent>
          <div className="clear-both mt-4 flex flex-col gap-3 pt-4 border-t border-parchment/50">
            {benefits && benefits.length > 0 && (
              <div className="[&_ul]:grid [&_ul]:grid-cols-2 [&_ul]:gap-x-4 [&_ul]:gap-y-2.5">
                <BenefitsList benefits={benefits} />
              </div>
            )}
            {nutrition && <NutritionTable nutrition={nutrition} />}
            {((servingIdeas && servingIdeas.length > 0) ||
              (occasions && occasions.length > 0)) && (
              <div className="grid grid-cols-2 gap-3">
                {servingIdeas && servingIdeas.length > 0 && (
                  <ServingIdeas servingIdeas={servingIdeas} />
                )}
                {occasions && occasions.length > 0 && (
                  <ProductOccasions occasions={occasions} />
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}

      {/* Footer — price + (optional compact Details icon) + add-to-cart, pinned to bottom */}
      <ProductPriceAndCart
        product={product}
        selectedVariant={selectedVariant}
        actionPrefix={
          hasDetails ? (
            <CollapsibleTrigger
              onClick={stop}
              aria-label="Show details"
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border border-earth/15 text-earth/55 hover:text-orange hover:border-orange transition-colors"
            >
              <CollapsibleChevron />
            </CollapsibleTrigger>
          ) : undefined
        }
      />
    </Collapsible>
  );

  if (product.slug) {
    return (
      <Link
        href={`/products/${product.slug}${from ? `?from=${from}` : ""}`}
        className="block h-full"
      >
        {card}
      </Link>
    );
  }

  return card;
}
