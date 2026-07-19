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
    name: "Shop — HONESTA Natural Dried Fruits",
    description:
      "Handcrafted dried fruits and pastila. 100% fruit. No added sugar. No additives. Small batch production with love.",
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
        url: `${shopUrl}?category=${c.slug}`,
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
