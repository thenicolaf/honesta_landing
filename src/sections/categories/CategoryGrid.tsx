import { CategoryCard } from "./CategoryCard";
import { PUBLIC_CATEGORY_GRID_CLASS } from "./CategoryGridSkeleton";
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

        <div className={PUBLIC_CATEGORY_GRID_CLASS}>
          {categories.map((card) => (
            <CategoryCard key={card.name} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
