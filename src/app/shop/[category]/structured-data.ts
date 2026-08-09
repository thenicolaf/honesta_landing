import type { DbCategory } from "@/sections/categories/types";

interface ProductLite {
  slug: string;
  title: string;
  image_url: string | null;
}

export function buildCategoryCollectionJsonLd(
  category: DbCategory,
  products: ProductLite[],
  siteUrl: string,
) {
  const categoryUrl = `${siteUrl}/shop/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collectionpage`,
    name: `${category.name} — HONESTA`,
    ...(category.description ? { description: category.description } : {}),
    url: categoryUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: category.name,
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${siteUrl}/products/${p.slug}`,
        ...(p.image_url ? { image: p.image_url } : {}),
      })),
    },
  };
}

export function buildCategoryBreadcrumbJsonLd(
  category: DbCategory,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${siteUrl}/shop/${category.slug}`,
      },
    ],
  };
}
