import type { MixBox } from "@/lib/mixBoxesDb";

export function buildMixCollectionJsonLd(boxes: MixBox[], siteUrl: string) {
  if (boxes.length === 0) return null;

  const mixUrl = `${siteUrl}/mix`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${mixUrl}#collectionpage`,
    name: "Build Your Mix — HONESTA",
    description:
      "Build your own HONESTA dried-fruit mix. Pick a box, fill each cell with fruit of your choice — natural, no added sugar, no additives.",
    url: mixUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Active Mix Boxes",
      numberOfItems: boxes.length,
      itemListElement: boxes.map((box, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: box.name,
        ...(box.description ? { description: box.description } : {}),
        url: `${mixUrl}?box=${box.slug}`,
        ...(box.image_url ? { image: box.image_url } : {}),
      })),
    },
  };
}

export function buildMixBreadcrumbJsonLd(siteUrl: string) {
  const mixUrl = `${siteUrl}/mix`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Build Your Mix",
        item: mixUrl,
      },
    ],
  };
}
