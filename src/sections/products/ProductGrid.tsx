"use client";

import { motion } from "motion/react";
import { FilterBar, EmptyState } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";
import { ProductItem } from "./ProductItem";
import type { DbProduct, DbProductGridProps, Product } from "./types";
import { mapDbProducts } from "./utils";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductHeader() {
  return (
    <motion.div
      className="mb-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
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
    </motion.div>
  );
}

function ProductEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <EmptyState
        icon={
          <p
            className="font-display font-semibold text-heading/15 leading-none select-none"
            style={{ fontSize: "clamp(4rem, 10vw, 7rem)" }}
          >
            ∅
          </p>
        }
        label="Coming soon"
        description="We're working on this collection. Check back soon."
        className="py-0"
      />
    </motion.div>
  );
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <motion.div
          key={product.id ?? product.title}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.07 }}
          className="h-full"
        >
          <ProductItem product={product} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── ProductGridInner ────────────────────────────────────────────────────────

function ProductGridInner({ rawProducts, categories }: { rawProducts: DbProduct[]; categories: DbProductGridProps["categories"] }) {
  const categoryFilter = useFilterBar("category");

  const filtered = categoryFilter.value
    ? rawProducts.filter((p) => p.categories?.slug === categoryFilter.value)
    : rawProducts;
  const products = mapDbProducts(filtered);

  return (
    <>
      <motion.div
        className="mb-10 flex justify-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <FilterBar
          {...categoryFilter}
          items={categories ?? []}
          className="justify-center"
        />
      </motion.div>
      {products.length === 0 ? (
        <ProductEmptyState />
      ) : (
        <ProductList products={products} />
      )}
    </>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({ rawProducts, categories }: DbProductGridProps) {
  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <ProductHeader />
        <ProductGridInner rawProducts={rawProducts} categories={categories} />
      </div>
    </section>
  );
}
