import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/productsDb";
import { mapDbProducts } from "@/sections/products/utils";
import { ProductDetailPage } from "@/pages_flow/products/ProductDetailPage";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "./structured-data";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dbProduct = await getProductBySlug(id);
  if (!dbProduct) return {};

  const description =
    dbProduct.tagline ??
    `${dbProduct.title} — natural dried fruit by HONESTA. No sugar. No additives.`;

  return {
    title: dbProduct.title,
    description,
    openGraph: {
      title: dbProduct.title,
      description,
      images: dbProduct.image_url ? [{ url: dbProduct.image_url }] : [],
      type: "website",
    },
  };
}

const FROM_MAP: Record<string, { href: string; label: string }> = {
  favorites: { href: "/panel/favorites", label: "Back to favorites" },
  cart: { href: "/cart", label: "Back to cart" },
};

export default async function Page({ params, searchParams }: Props) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const dbProduct = await getProductBySlug(id);
  if (!dbProduct) notFound();

  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const [product] = mapDbProducts([dbProduct]);

  const productJsonLd = buildProductJsonLd(dbProduct, product, siteUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(dbProduct, product, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailPage
        product={product}
        {...(from && FROM_MAP[from] ? { backHref: FROM_MAP[from].href, backLabel: FROM_MAP[from].label } : {})}
      />
    </>
  );
}
