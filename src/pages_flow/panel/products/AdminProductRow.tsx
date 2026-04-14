"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  ProductHeader,
  ProductTitle,
  ProductTags,
  ProductIngredients,
  ProductFreeFrom,
  ProductNote,
  ProductStatusMenu,
  BenefitsList,
  NutritionTable,
  ServingIdeas,
  ProductOccasions,
  hasDetailsContent,
} from "@/sections/products/components";
import { mapAdminProduct } from "@/sections/products/utils";
import { useProductActions } from "./ProductActionsProvider";
import { AdminVariantBadges } from "./AdminVariantBadges";

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function AdminProductRow({ product }: { product: AdminDbProduct }) {
  const router = useRouter();
  const { openDelete } = useProductActions();
  const {
    badge,
    category,
    tags,
    freeFrom,
    ingredients,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
    promotion,
  } = mapAdminProduct(product);

  const sale = !!promotion;
  const mark = product.mark;
  const outOfStock = product.in_stock === false;
  const hasDetails = hasDetailsContent({
    benefits,
    nutrition,
    servingIdeas,
    occasions,
  });

  const actions = (
    <div className="flex items-center gap-2">
      <ProductStatusMenu
        productId={product.id}
        status={product.status}
        onDelete={() => openDelete(product)}
      />
      <Button
        as="button"
        type="button"
        variant="outline"
        size="sm"
        startIcon={<Pencil size={12} aria-hidden="true" />}
        onClick={(e) => {
          stop(e);
          router.push(`/panel/products/${product.id}/edit`);
        }}
        aria-label={`Edit ${product.title}`}
      >
        Edit
      </Button>
    </div>
  );

  return (
    <Link
      href={`/panel/products/${product.id}/details`}
      className="flex flex-col h-full rounded-2xl bg-white-warm border border-earth/8 hover:shadow-lg hover:border-transparent transition-all duration-300 p-3 sm:p-4"
    >
      {/* Content area — children are direct siblings of the float so they wrap
          around the image naturally; long text (ProductNote) flows under it.
          grow keeps the footer pinned to the bottom. */}
      <div className="grow flow-root space-y-3">
        {/* Floated image — aspect-4/3, compact on mobile, grows on wider screens.
            At xl+ the grid splits into 2 columns, so the image narrows accordingly. */}
        <div className="relative float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56 aspect-4/3 rounded-xl overflow-hidden bg-sand">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
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

          {outOfStock && (
            <Badge
              variant="outline"
              size="xs"
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 bg-white-warm/80 backdrop-blur-sm sm:px-3! sm:py-1! sm:text-2xs!"
            >
              Out of stock
            </Badge>
          )}
        </div>

        {/* Category label + title + badge — title sits between category and badge */}
        <ProductHeader category={category} />
        <ProductTitle title={product.title} />
        {badge && (
          <div className="-translate-x-2">
            <Badge variant="natural">{badge}</Badge>
          </div>
        )}

        <AdminVariantBadges
          variants={product.product_variants}
          promotion={promotion}
          mark={product.mark}
          size="xs"
        />

        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductIngredients ingredients={ingredients} />
        <ProductNote note={product.note ?? undefined} />
      </div>

      {/* Footer — Details trigger (left) + expandable content above + actions (right) */}
      {hasDetails ? (
        <Collapsible className="clear-both mt-4">
          <CollapsibleContent>
            <div className="flex flex-col gap-3 pb-3">
              {/* Override BenefitsList's flex-col ul with a 2-column grid so short
                  descriptions don't leave a large empty column on the right. */}
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

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-parchment/50">
            <CollapsibleTrigger
              onClick={stop}
              className="flex items-center gap-2 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors duration-200"
            >
              Details
              <CollapsibleChevron />
            </CollapsibleTrigger>
            {actions}
          </div>
        </Collapsible>
      ) : (
        <div className="clear-both mt-4 flex justify-end pt-3 border-t border-parchment/50">
          {actions}
        </div>
      )}
    </Link>
  );
}
