"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  ProductImage,
  ProductHeader,
  ProductTitle,
  IngredientsInline,
  NoteButton,
  ViewButton,
  ProductAdminActions,
} from "@/sections/products/components";
import { mapAdminProduct } from "@/sections/products/utils";
import { useProductActions } from "./ProductActionsProvider";
import { AdminVariantBadges } from "./AdminVariantBadges";

export function AdminProductCard({ product }: { product: AdminDbProduct }) {
  const { openDelete } = useProductActions();
  const { badge, category, ingredients, promotion } = mapAdminProduct(product);
  const href = `/panel/products/${product.id}/details`;

  return (
    <div className="relative z-0 has-[[role=tooltip]]:z-10 h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 hover:shadow-lg hover:border-transparent transition-[box-shadow,border-color] duration-300">
      <div className="relative">
        <Link href={href} className="block" aria-label={product.title}>
          <ProductImage
            image_url={product.image_url ?? ""}
            title={product.title}
            sale={!!promotion}
            mark={product.mark}
            topRight={
              product.in_stock === false ? (
                <Badge
                  variant="outline"
                  size="xs"
                  className="absolute top-2 right-2 z-20 bg-white-warm/80 backdrop-blur-sm"
                >
                  Out of stock
                </Badge>
              ) : undefined
            }
          />
        </Link>
        <ViewButton href={href} />
        <NoteButton note={product.note ?? undefined} />
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <ProductHeader category={category} badge={badge} />
        <ProductTitle title={product.title} />

        <IngredientsInline ingredients={ingredients} />

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <AdminVariantBadges
            variants={product.product_variants}
            promotion={promotion}
            mark={product.mark}
            size="xs"
          />
          <ProductAdminActions
            productId={product.id}
            productTitle={product.title}
            status={product.status}
            onDelete={() => openDelete(product)}
          />
        </div>
      </div>
    </div>
  );
}
