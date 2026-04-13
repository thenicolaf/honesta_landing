"use client";

import { EmptyState } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { ProductItem } from "./ProductItem";
import { ProductToolbar } from "./ProductToolbar";
import { useFilteredProducts } from "./useFilteredProducts";
import type { DbProductGridProps, Product } from "./types";

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
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={product.id ?? product.title} className="h-full">
          <ProductItem product={product} />
        </div>
      ))}
    </div>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  rawProducts,
  categories,
  salesMap,
}: DbProductGridProps) {
  const filters = useFilteredProducts(rawProducts, salesMap);

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
