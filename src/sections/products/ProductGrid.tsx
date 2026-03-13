"use client";

import { motion } from "motion/react";
import { TagToolbar, TagToolbarItem } from "@/shared/ui";
import { ProductItem } from "./ProductItem";
import { Category } from "@/shared/types";
import { useCategoryFilter } from "@/providers";
import type { DbProductGridProps, Product } from "./types";
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

function ProductFilter({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <motion.div
      className="mb-10 flex justify-center"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <TagToolbar
        value={value}
        onValueChange={onValueChange}
        className="justify-center"
      >
        <TagToolbarItem value="">All</TagToolbarItem>
        {Object.values(Category).map((cat) => (
          <TagToolbarItem key={cat} value={cat}>
            {cat}
          </TagToolbarItem>
        ))}
      </TagToolbar>
    </motion.div>
  );
}

function ProductEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-20 flex flex-col items-center gap-4 text-center"
    >
      <p
        className="font-display font-semibold text-heading/15 leading-none select-none"
        style={{ fontSize: "clamp(4rem, 10vw, 7rem)" }}
      >
        ∅
      </p>
      <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/35">
        Coming soon
      </p>
      <p className="font-body font-light text-sm text-earth/40 max-w-xs">
        We&apos;re working on this collection. Check back soon.
      </p>
    </motion.div>
  );
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <motion.div
          key={product.name}
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

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({ rawProducts }: DbProductGridProps) {
  const { activeCategory, setActiveCategory } = useCategoryFilter();

  const products: Product[] = mapDbProducts(rawProducts);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <ProductHeader />
        <ProductFilter
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as Category | "")}
        />
        {filtered.length === 0 ? (
          <ProductEmptyState />
        ) : (
          <ProductList products={filtered} />
        )}
      </div>
    </section>
  );
}
