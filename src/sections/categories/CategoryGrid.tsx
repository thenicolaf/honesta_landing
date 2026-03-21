"use client";

import { motion } from "motion/react";
import { CategoryCard } from "./CategoryCard";
import { containerVariants } from "./consts";
import type { DbCategory, CategoryCard as CategoryCardData } from "./types";

export function CategoryGrid({
  categories: dbCategories,
}: {
  categories?: DbCategory[];
}) {
  const categories: CategoryCardData[] = (dbCategories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    audience: c.audience,
    tagline: c.tagline,
    description: c.description,
    image_url: c.image_url,
    badge: c.badge,
    href: `/?category=${c.slug}#products`,
  }));

  return (
    <section id="categories" className="bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-4">
            Collections
          </p>
          <h2
            className="font-display font-semibold text-heading leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Find your perfect snack
          </h2>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {categories.map((card) => (
            <CategoryCard key={card.name} {...card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
