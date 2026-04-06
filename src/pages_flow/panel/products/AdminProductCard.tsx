"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  ProductTags,
  ProductFreeFrom,
  ProductDetails,
  ProductNote,
  ProductAdminActions,
} from "@/sections/products/components";
import { mapAdminProduct } from "@/sections/products/utils";
import { useProductActions } from "./ProductActionsProvider";
import { AdminVariantBadges } from "./AdminVariantBadges";

export function AdminProductCard({ product }: { product: AdminDbProduct }) {
  const { openDelete } = useProductActions();
  const {
    badge,
    category,
    tagline,
    tags,
    freeFrom,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
    promotion,
  } = mapAdminProduct(product);

  return (
    <Link
      href={`/panel/products/${product.id}/details`}
      className="h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 hover:shadow-lg hover:border-transparent transition-all duration-300"
    >
      <ProductImage
        image_url={product.image_url ?? ""}
        title={product.title}
        tagline={tagline}
        sale={!!promotion}
        mark={product.mark}
        topRight={
          product.in_stock === false ? (
            <Badge
              variant="outline"
              size="sm"
              className="absolute top-3 right-3 z-20 bg-white-warm/80 backdrop-blur-sm"
            >
              Out of stock
            </Badge>
          ) : undefined
        }
      />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader category={category} badge={badge} />
        <ProductTitle title={product.title} />

        <AdminVariantBadges
          variants={product.product_variants}
          promotion={promotion}
          mark={product.mark}
          size="xs"
        />

        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductNote note={product.note ?? undefined} truncate />
        <ProductDetails
          benefits={benefits}
          nutrition={nutrition}
          servingIdeas={servingIdeas}
          occasions={occasions}
        />

        <ProductAdminActions
          productId={product.id}
          productTitle={product.title}
          status={product.status}
          onDelete={() => openDelete(product)}
        />
      </div>
    </Link>
  );
}
