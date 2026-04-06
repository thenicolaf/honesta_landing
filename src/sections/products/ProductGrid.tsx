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
import { cn } from "@/shared/utils/cn";
import { useFilterBar } from "@/providers/FilterProvider";
import { findActivePromotion } from "@/shared/utils/calculateDiscount";
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
            delay: (i % 3) * 0.05,
          }}
          className="h-full"
        >
          <ProductItem product={product} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── ProductGridInner ────────────────────────────────────────────────────────

const MARK_ITEMS = [
  { value: "best_seller", label: "Best Sellers" },
  { value: "promotions", label: "Promotions" },
  { value: "new", label: "New" },
];

const SORT_OPTIONS: { value: ProductSortKey; label: string }[] = [
  { value: "promotions", label: "Promotions" },
  { value: "best_sellers", label: "Best Sellers" },
  { value: "new", label: "New" },
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
  const markFilter = useFilterBar("mark");

  const hasPromo = rawProducts.some((p) => findActivePromotion(p.promotion_products));
  const defaultSort: ProductSortKey = hasPromo ? "promotions" : "best_sellers";
  const sortDisabled = markFilter.value !== "";
  const effectiveSort = sortDisabled
    ? ""
    : ((sortFilter.value || defaultSort) as ProductSortKey);

  const sorted = useMemo(() => {
    const searchVal = searchFilter.value.toLowerCase();
    const markVal = markFilter.value;

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
      if (
        markVal === "promotions" &&
        !findActivePromotion(p.promotion_products)
      )
        return false;
      if (markVal === "best_seller" && p.mark !== "best_seller") return false;
      if (markVal === "new" && p.mark !== "new") return false;
      return true;
    });

    const products = mapDbProducts(filtered, salesMap);
    return sortProducts(products, effectiveSort);
  }, [
    rawProducts,
    salesMap,
    categoryFilter.value,
    effectiveSort,
    searchFilter.value,
    markFilter.value,
  ]);

  return (
    <>
      <motion.div
        className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end"
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
          wrapperClassName="w-full lg:flex-1"
          className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:contents">
          <Select
            value={categoryFilter.value}
            onValueChange={categoryFilter.onValueChange}
            options={(categories ?? []).map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            clearable
          >
            <SelectTrigger className="w-full lg:w-56 h-9">
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
            value={markFilter.value}
            onValueChange={markFilter.onValueChange}
            options={MARK_ITEMS}
            clearable
          >
            <SelectTrigger className="w-full lg:w-44 h-9">
              <SelectValue placeholder="All" />
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
            value={effectiveSort}
            onValueChange={sortFilter.onValueChange}
            options={SORT_OPTIONS}
            clearable
          >
            <SelectTrigger
              className={cn(
                "w-full lg:w-48 h-9",
                sortDisabled && "opacity-50 pointer-events-none",
              )}
            >
              <ArrowUpDown size={12} className="shrink-0 mr-1.5 text-earth/40" />
              <SelectValue placeholder="By Category" className="mr-auto" />
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
        </div>
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
