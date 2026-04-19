import type { DbProduct } from "@/sections/products/types/db-types";
import type { Product } from "@/sections/products/types";

export function buildDescription(dbProduct: DbProduct, product: Product): string {
  return (
    [
      dbProduct.tagline,
      product.tags.length > 0 ? product.tags.join(", ") : null,
      product.freeFrom.length > 0 ? `Free from: ${product.freeFrom.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(". ") || `${dbProduct.title} — natural dried fruit by HONESTA.`
  );
}

function buildVariantOffers(
  product: Product,
  slug: string,
  availability: string,
  productUrl: string,
) {
  return product.variants.map((v) => {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      name: `${v.weight_g}g`,
      sku: `${slug}-${v.id}`,
      price: product.promotion ? product.promotion.discountedPrice : v.price,
      priceCurrency: "AED",
      availability,
      url: productUrl,
    };
    if (product.promotion?.endsAt) {
      offer.priceValidUntil = product.promotion.endsAt.split("T")[0];
    }
    return offer;
  });
}

export function buildProductJsonLd(dbProduct: DbProduct, product: Product, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${dbProduct.slug}`;
  const allImages = [dbProduct.image_url, ...((dbProduct.images as string[] | null) ?? [])].filter(Boolean);
  const prices = product.variants.map((v) => v.price).sort((a, b) => a - b);
  const availability =
    dbProduct.in_stock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const description = buildDescription(dbProduct, product);
  const variantOffers = buildVariantOffers(product, dbProduct.slug, availability, productUrl);

  const additionalProperty = [
    ...product.tags.map((t) => ({ "@type": "PropertyValue", name: "Tag", value: t })),
    ...product.freeFrom.map((f) => ({ "@type": "PropertyValue", name: "Free from", value: f })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dbProduct.title,
    description,
    image: allImages,
    sku: dbProduct.slug,
    category: product.category,
    brand: { "@type": "Organization", name: "HONESTA" },
    offers:
      product.variants.length > 1
        ? {
            "@type": "AggregateOffer",
            lowPrice: prices[0],
            highPrice: prices[prices.length - 1],
            priceCurrency: "AED",
            offerCount: product.variants.length,
            availability,
            offers: variantOffers,
          }
        : variantOffers[0] ?? {
            "@type": "Offer",
            price: product.price ?? 0,
            priceCurrency: "AED",
            availability,
            url: productUrl,
          },
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };
}

export function buildBreadcrumbJsonLd(dbProduct: DbProduct, product: Product, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${dbProduct.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...(product.category
        ? [{ "@type": "ListItem", position: 2, name: product.category, item: `${siteUrl}/#categories` }]
        : []),
      { "@type": "ListItem", position: product.category ? 3 : 2, name: dbProduct.title, item: productUrl },
    ],
  };
}
