import type { DbCategory } from "@/sections/categories/types";

export function buildShopCollectionJsonLd(
  categories: DbCategory[],
  siteUrl: string,
) {
  const shopUrl = `${siteUrl}/shop`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${shopUrl}#collectionpage`,
    name: "Shop — HONESTA Premium Natural Foods",
    description:
      "Shop HONESTA dried fruits, fruit rolls, dried vegetables, ghee, jerky and gift selections, carefully made in the UAE.",
    url: shopUrl,
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
  };
}

export function buildShopBreadcrumbJsonLd(siteUrl: string) {
  const shopUrl = `${siteUrl}/shop`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: shopUrl },
    ],
  };
}
