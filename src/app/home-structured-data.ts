import type { DbCategory } from "@/sections/categories/types";

export function buildHomeStructuredData(
  categories: DbCategory[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/#collectionpage`,
    name: "HONESTA — Natural Dried Fruits",
    description:
      "Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives. Small batch production with love.",
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
        url: `${siteUrl}/?category=${c.slug}#products`,
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
