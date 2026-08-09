import type { DbCategory } from "@/sections/categories/types";

export function buildHomeStructuredData(
  categories: DbCategory[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/#collectionpage`,
    name: "HONESTA — Premium Natural Foods Made in UAE",
    description:
      "Premium natural foods made in the UAE — dried fruits, fruit rolls, dried vegetables, ghee, jerky and curated gifts. Real ingredients, honest taste.",
    url: siteUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Product Categories",
      numberOfItems: categories.length,
      itemListElement: categories.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        description: c.tagline,
        url: `${siteUrl}/shop/${c.slug}`,
        ...(c.image_url ? { image: c.image_url } : {}),
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ],
    },
  };
}
