import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/productsDb";
import { mapDbProducts } from "@/sections/products/utils";
import { ProductDetailPage } from "@/pages_flow/products/ProductDetailPage";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "./structured-data";

interface Props {
  params: Promise<{ id: string }>;
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

export default async function Page({ params }: Props) {
  const { id } = await params;
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
      <ProductDetailPage product={product} />
    </>
  );
}
