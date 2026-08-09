import type { DbProduct } from "@/sections/products/types/db-types";
import type { Product } from "@/sections/products/types";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";

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
    // Discount is recomputed per variant (matching the visible page) — a single
    // product-level discountedPrice would be wrong for larger variants under a
    // percentage promotion.
    const price = product.promotion
      ? calculateDiscountedPrice(
          v.price,
          product.promotion.discountType,
          product.promotion.discountValue,
        )
      : v.price;

    const offer: Record<string, unknown> = {
      "@type": "Offer",
      name: `${v.weight_g}g`,
      sku: `${slug}-${v.id}`,
      price,
      priceCurrency: "AED",
      itemCondition: "https://schema.org/NewCondition",
      availability,
      url: productUrl,
      weight: {
        "@type": "QuantitativeValue",
        value: v.weight_g,
        unitCode: "GRM",
      },
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
            url: productUrl,
            offers: variantOffers,
          }
        : variantOffers[0] ?? {
            "@type": "Offer",
            price: product.price ?? 0,
            priceCurrency: "AED",
            itemCondition: "https://schema.org/NewCondition",
            availability,
            url: productUrl,
          },
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };
}

export function buildBreadcrumbJsonLd(dbProduct: DbProduct, product: Product, siteUrl: string) {
  const productUrl = `${siteUrl}/products/${dbProduct.slug}`;
  const categorySlug = dbProduct.categories?.slug;

  // Mirror the visible breadcrumbs: Home > Shop > Category > Product.
  const items = [
    { name: "Home", item: siteUrl },
    { name: "Shop", item: `${siteUrl}/shop` },
    ...(product.category
      ? [
          {
            name: product.category,
            item: categorySlug
              ? `${siteUrl}/shop/${categorySlug}`
              : `${siteUrl}/shop`,
          },
        ]
      : []),
    { name: dbProduct.title, item: productUrl },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
