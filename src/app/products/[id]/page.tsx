import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/productsDb";
import { mapDbProducts } from "@/sections/products/utils";
import { ProductDetailPage } from "@/pages_flow/products/ProductDetailPage";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dbProduct.title,
    description:
      dbProduct.tagline ??
      `${dbProduct.title} — natural dried fruit by HONESTA.`,
    image: dbProduct.image_url,
    brand: { "@type": "Organization", name: "HONESTA" },
    offers: {
      "@type": "Offer",
      price: dbProduct.price,
      priceCurrency: "AED",
      availability:
        dbProduct.in_stock !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${dbProduct.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailPage product={product} />
    </>
  );
}
