"use client";

import { motion } from "motion/react";
import { products } from "./consts";
import { ProductItem } from "./ProductItem";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
  useCollapsible,
} from "@/shared/ui";

const PAGE_SIZE = 6;

function ExtraToggleLabel({ count }: { count: number }) {
  const { open } = useCollapsible();
  return open ? (
    <span>Show less</span>
  ) : (
    <>
      <span>More products</span>
      <span className="text-earth/25">({count})</span>
    </>
  );
}

export function ProductGrid() {
  const initial = products.slice(0, PAGE_SIZE);
  const extra = products.slice(PAGE_SIZE);
  const hasMore = extra.length > 0;

  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-[11px] text-moss mb-4">
            What&apos;s inside the bag
          </p>
          <h2
            className="font-display font-bold italic text-earth leading-tight mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Pure fruit. Nothing else.
          </h2>
          <p className="font-body font-light text-earth/55 text-lg">Nothing added. Nothing hidden.</p>
        </motion.div>

        {/* First PAGE_SIZE items */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initial.map((product, i) => (
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

        {/* Extra items */}
        {hasMore && (
          <Collapsible className="mt-10 flex flex-col items-center">
            <CollapsibleContent className="w-full">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {extra.map((product) => (
                  <div key={product.name} className="h-full">
                    <ProductItem product={product} />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
            <CollapsibleTrigger className="flex items-center gap-2 font-body font-semibold uppercase tracking-[0.14em] text-[11px] text-earth/40 hover:text-orange transition-colors duration-200">
              <CollapsibleChevron />
              <ExtraToggleLabel count={extra.length} />
            </CollapsibleTrigger>
          </Collapsible>
        )}
      </div>
    </section>
  );
}
