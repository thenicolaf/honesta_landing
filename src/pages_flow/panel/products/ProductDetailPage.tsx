"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { AdminDbProduct } from "@/lib/productsDb";
import {
  ProductHeader,
  ProductExpandedDetails,
  ProductIngredientsSection,
  ProductDetailImage,
  ProductTagline,
  ProductNote,
  ProductStatusMenu,
} from "@/sections/products/components";

import { mapAdminProduct } from "@/sections/products/utils";
import { AdminVariantBadges } from "./AdminVariantBadges";
import { ProductActionsProvider, useProductActions } from "./ProductActionsProvider";

interface ProductDetailPageProps {
  product: AdminDbProduct;
}

function ProductDetailContent({ product }: ProductDetailPageProps) {
  const { openDelete } = useProductActions();
  const {
    badge,
    category,
    tagline,
    tags,
    freeFrom,
    ingredients,
    benefits,
    nutrition,
    servingIdeas,
    occasions,
    promotion,
  } = mapAdminProduct(product);

  return (
    <>
      <div className="mb-6">
        <Button
          as="a"
          href="/panel/products"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to products
        </Button>
      </div>

      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-2">
        Admin Panel
      </p>
      <h1
        className="font-display font-bold italic text-heading mb-8 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        {product.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* Image column */}
        <ProductDetailImage
          image_url={product.image_url ?? ""}
          images={(product.images as string[] | null) ?? []}
          title={product.title}
          sale={!!promotion}
          mark={product.mark}
        />

        {/* Content column */}
        <div className="flex flex-col gap-5">
          <ProductHeader
            category={category}
            badge={badge}
            extraBadges={
              product.in_stock === false ? (
                <Badge variant="outline" size="sm">
                  Out of stock
                </Badge>
              ) : undefined
            }
          />

          <ProductTagline tagline={tagline} />

          <ProductIngredientsSection ingredients={ingredients} />

          <AdminVariantBadges
            variants={product.product_variants}
            promotion={promotion}
            mark={product.mark}
            size="sm"
          />

          <ProductNote note={product.note ?? undefined} />

          <ProductExpandedDetails
            benefits={benefits}
            nutrition={nutrition}
            servingIdeas={servingIdeas}
            occasions={occasions}
            tags={tags}
            freeFrom={freeFrom}
          />

          {/* Admin actions */}
          <div className="flex items-center gap-2 pt-5 mt-auto border-t border-earth/8 [&>a]:grow [&>button]:grow">
            <ProductStatusMenu
              productId={product.id}
              status={product.status}
              onDelete={() => openDelete(product)}
              labelClassName="inline!"
            />
            <Button
              as="a"
              href={`/panel/products/${product.id}/edit`}
              variant="outline"
              size="sm"
              startIcon={<Pencil size={12} aria-hidden="true" />}
              aria-label={`Edit ${product.title}`}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  return (
    <ProductActionsProvider>
      <ProductDetailContent product={product} />
    </ProductActionsProvider>
  );
}
