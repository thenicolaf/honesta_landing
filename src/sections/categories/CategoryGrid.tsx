"use client";

import { ViewModeToggle } from "@/shared/ui";
import { useViewMode } from "@/providers/ViewModeProvider";
import { CategoryCard } from "./CategoryCard";
import { CategoryCardRow } from "./CategoryCardRow";
import type { DbCategory, CategoryCard as CategoryCardData } from "./types";

export function CategoryGrid({
  categories: dbCategories,
}: {
  categories?: DbCategory[];
}) {
  const { mode } = useViewMode();

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

  const gridClass =
    mode === "row"
      ? "grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6"
      : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <section id="categories" className="bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        {/* Section header */}
        <div className="mb-10 text-center">
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-4">
            Collections
          </p>
          <h2
            className="font-display font-semibold text-heading leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Find your perfect snack
          </h2>
        </div>

        {/* View toggle */}
        <div className="mb-6 flex justify-end">
          <ViewModeToggle />
        </div>

        {/* Cards grid */}
        <div className={gridClass}>
          {categories.map((card) =>
            mode === "row" ? (
              <CategoryCardRow key={card.name} {...card} />
            ) : (
              <CategoryCard key={card.name} {...card} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
