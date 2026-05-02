import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/ui";
import { getProductBySlug } from "@/lib/productsDb";
import { mapDbProducts } from "@/sections/products/utils";
import { ProductDetailPage } from "@/pages_flow/products/ProductDetailPage";
import { PromoSliderSection } from "@/pages_flow/home";
import { PromoSliderSkeleton } from "@/sections";
import { isSafeBackHref } from "@/shared/utils/backHref";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildDescription,
} from "./structured-data";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; back?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dbProduct = await getProductBySlug(id);
  if (!dbProduct) return {};

  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const [product] = mapDbProducts([dbProduct]);
  const description = buildDescription(dbProduct, product);
  const productUrl = `${siteUrl}/products/${dbProduct.slug}`;
  const ogImages = [
    dbProduct.image_url,
    ...((dbProduct.images as string[] | null) ?? []),
  ].filter((u): u is string => !!u);

  return {
    title: dbProduct.title,
    description,
    keywords: product.tags.length > 0 ? product.tags : undefined,
    alternates: { canonical: productUrl },
    openGraph: {
      title: dbProduct.title,
      description,
      url: productUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: ogImages.length > 0 ? ogImages.map((url) => ({ url })) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dbProduct.title,
      description,
      images: ogImages.length > 0 ? ogImages : undefined,
    },
  };
}

const FROM_MAP: Record<string, { href: string; label: string }> = {
  favorites: { href: "/panel/favorites", label: "Back to favorites" },
  cart: { href: "/cart", label: "Back to cart" },
  promo: { href: "/#promo", label: "Back to promo" },
  products: { href: "/#products", label: "Back to products" },
};

function ProductSkeleton() {
  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Skeleton className="h-8 w-40 rounded-full mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          <Skeleton className="aspect-3/2 w-full rounded-[16px]" />
          <div className="flex flex-col gap-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

async function ProductContent({
  id,
  from,
  back,
}: {
  id: string;
  from?: string;
  back?: string;
}) {
  const dbProduct = await getProductBySlug(id);
  if (!dbProduct) notFound();

  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const [product] = mapDbProducts([dbProduct]);

  // Resolve the back link: prefer an explicit `?back=` URL (carries filter
  // state), fall back to the static FROM_MAP entry; label always comes from
  // FROM_MAP[from] when available so we keep "Back to {origin}" wording.
  const fallback = from ? FROM_MAP[from] : undefined;
  const safeBack = isSafeBackHref(back) ? back : undefined;
  const backHref = safeBack ?? fallback?.href;
  const backLabel = fallback?.label ?? (safeBack ? "Back" : undefined);

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
        {...(backHref ? { backHref, backLabel } : {})}
        belowGrid={
          <Suspense key="promo-slider" fallback={<PromoSliderSkeleton />}>
            <PromoSliderSection
              excludeId={product.id}
              kicker="More to explore"
              title="You might also like"
              withAnchor={false}
              headerClassName="text-left md:pl-12"
              from={from ?? "products"}
              backHref={safeBack}
            />
          </Suspense>
        }
      />
    </>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const [{ id }, { from, back }] = await Promise.all([params, searchParams]);

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent id={id} from={from} back={back} />
    </Suspense>
  );
}
