"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowUpDown, Search } from "lucide-react";

import {
  EmptyState,
  FormInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { useFilterBar } from "@/providers/FilterProvider";
import { ProductItem } from "./ProductItem";
import type { DbProduct, DbProductGridProps, Product } from "./types";
import { mapDbProducts, sortProducts, type ProductSortKey } from "./utils";

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
        icon={<IconLeaf className="w-12 h-12 text-earth/15" />}
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

const SORT_OPTIONS: {
  value: ProductSortKey;
  label: string;
  promoOnly?: boolean;
}[] = [
  { value: "", label: "Recommended" },
  { value: "promotions", label: "On Sale", promoOnly: true },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "category", label: "By Category" },
];

function ProductGridInner({
  rawProducts,
  categories,
  salesMap,
}: {
  rawProducts: DbProduct[];
  categories: DbProductGridProps["categories"];
  salesMap?: Record<string, number>;
}) {
  const categoryFilter = useFilterBar("category");
  const sortFilter = useFilterBar("sort");
  const searchFilter = useFilterBar("search");

  const sorted = useMemo(() => {
    const searchVal = searchFilter.value.toLowerCase();

    const filtered = rawProducts.filter((p) => {
      if (categoryFilter.value && p.categories?.slug !== categoryFilter.value)
        return false;
      if (searchVal) {
        const tags = p.product_tags?.map((t) => t.tag_options.label) ?? [];
        const haystack = [p.title, p.tagline, p.categories?.name, ...tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchVal)) return false;
      }
      return true;
    });

    const products = mapDbProducts(filtered, salesMap);
    return sortProducts(products, (sortFilter.value || "") as ProductSortKey);
  }, [
    rawProducts,
    salesMap,
    categoryFilter.value,
    sortFilter.value,
    searchFilter.value,
  ]);

  const hasPromo = sorted.some((p) => p.promotion);
  const visibleSortOptions = SORT_OPTIONS.filter(
    (o) => !o.promoOnly || hasPromo,
  );

  return (
    <>
      <motion.div
        className="mb-10 flex flex-col sm:flex-row sm:items-end items-stretch gap-4"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <FormInput
          type="text"
          placeholder="Search by name, tag, category..."
          value={searchFilter.value}
          onChange={(e) => searchFilter.onValueChange(e.target.value)}
          clearable
          onClear={() => searchFilter.onValueChange("")}
          startIcon={<Search size={14} />}
          wrapperClassName="w-full sm:flex-1"
          className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />

        <Select
          value={categoryFilter.value}
          onValueChange={categoryFilter.onValueChange}
          options={(categories ?? []).map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          clearable
        >
          <SelectTrigger className="w-full sm:w-56 h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {(options) =>
              options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        <Select
          value={sortFilter.value || ""}
          onValueChange={sortFilter.onValueChange}
          options={visibleSortOptions}
          clearable
        >
          <SelectTrigger className="w-full sm:w-48 h-9">
            <ArrowUpDown size={12} className="shrink-0 mr-1.5 text-earth/40" />
            <SelectValue placeholder="Sort by" className="mr-auto" />
          </SelectTrigger>
          <SelectContent>
            {(options) =>
              options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </motion.div>
      {sorted.length === 0 ? (
        <ProductEmptyState />
      ) : (
        <ProductList products={sorted} />
      )}
    </>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  rawProducts,
  categories,
  salesMap,
}: DbProductGridProps) {
  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <ProductHeader />
        <ProductGridInner
          rawProducts={rawProducts}
          categories={categories}
          salesMap={salesMap}
        />
      </div>
    </section>
  );
}
