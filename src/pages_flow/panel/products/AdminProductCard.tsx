"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  ProductWeight,
  ProductTags,
  ProductFreeFrom,
  ProductDetails,
  ProductAdminActions,
} from "@/sections/products/components";
import { mapAdminProduct } from "@/sections/products/utils";
import { useProductActions } from "./ProductActionsProvider";

export function AdminProductCard({ product }: { product: AdminDbProduct }) {
  const { openDelete } = useProductActions();
  const {
    category,
    tagline,
    tags,
    freeFrom,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
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
      />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader
          category={category}
          extraBadges={
            product.in_stock === false ? (
              <Badge variant="outline" size="sm">
                Out of stock
              </Badge>
            ) : undefined
          }
        />
        <ProductTitle title={product.title} />

        {/* Price + weight */}
        <div className="flex items-center gap-3 text-sm font-body">
          <span className="font-semibold text-earth">
            {parseFloat(product.price).toFixed(2)} AED
          </span>
          <ProductWeight weight_g={product.weight_g ?? undefined} />
        </div>

        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
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
