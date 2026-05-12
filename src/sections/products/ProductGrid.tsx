"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { buildBackHref } from "@/shared/utils/backHref";
import { productToGAItem, trackViewItemList } from "@/lib/analytics";
import { ProductItem } from "./ProductItem";
import { ProductToolbar } from "./ProductToolbar";
import { useFilteredProducts } from "./useFilteredProducts";
import { PRODUCT_GRID_CLASS } from "./ProductGridSkeleton";
import type { CategoryItem, DbProductGridProps, Product } from "./types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductHeader() {
  return (
    <div className="mb-10 text-center">
      <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-4">
        What&apos;s inside the bag
      </p>
      <h2
        className="font-display font-bold italic text-heading leading-tight mb-3"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        Pure fruit. Nothing else.
      </h2>
      <p className="font-body font-light text-earth/55 text-lg">
        Nothing added. Nothing hidden.
      </p>
    </div>
  );
}

function ProductList({ products }: { products: Product[] }) {
  // Preserve active filters + scroll back to the products section.
  const backHref = buildBackHref({
    pathname: "/",
    searchParams: useSearchParams(),
    hash: "#products",
  });

  return (
    <div className={PRODUCT_GRID_CLASS}>
      {products.map((product) => (
        <ProductItem
          key={product.id ?? product.title}
          product={product}
          from="products"
          backHref={backHref}
        />
      ))}
    </div>
  );
}

function useTrackViewItemList(
  products: Product[],
  categorySlug: string,
  categories?: CategoryItem[],
) {
  const lastFiredSlug = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (products.length === 0) return;
    if (lastFiredSlug.current === categorySlug) return;
    lastFiredSlug.current = categorySlug;
    const listName =
      categories?.find((c) => c.value === categorySlug)?.label ??
      (categorySlug || "All products");
    trackViewItemList(
      listName,
      products.map((p) => productToGAItem(p)),
    );
  }, [products, categorySlug, categories]);
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  rawProducts,
  categories,
  salesMap,
  shuffleSeed,
}: DbProductGridProps) {
  const filters = useFilteredProducts(rawProducts, salesMap, shuffleSeed);

  useTrackViewItemList(filters.products, filters.categoryFilter.value, categories);

  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <ProductHeader />
        <ProductToolbar categories={categories} filters={filters} />
        {filters.products.length === 0 ? (
          <EmptyState
            icon={<IconLeaf className="w-12 h-12 text-earth/15" />}
            label="Coming soon"
            description="We're working on this collection. Check back soon."
            className="py-0"
          />
        ) : (
          <ProductList products={filters.products} />
        )}
      </div>
    </section>
  );
}
