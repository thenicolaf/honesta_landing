import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/ui";
import { ProductGridSkeleton } from "@/sections/products/ProductGridSkeleton";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductsSection } from "@/pages_flow/shop";
import { TrustMarks } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import {
  buildShopCollectionJsonLd,
  buildShopBreadcrumbJsonLd,
} from "./structured-data";

const SHOP_DESCRIPTION =
  "Shop HONESTA natural dried fruits, fruit leathers and crisps — 100% fruit, no added sugar, no additives. Filter by category, browse best sellers and offers.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const shopUrl = `${siteUrl}/shop`;
  const { category } = await searchParams;

  if (category) {
    const categories = await getCategories();
    const match = categories.find((c) => c.slug === category);

    if (match) {
      return {
        title: `${match.name} — HONESTA`,
        description:
          match.description ||
          `${match.name}. ${match.tagline}. Natural dried fruits by HONESTA.`,
        alternates: { canonical: `${shopUrl}?category=${match.slug}` },
        openGraph: {
          title: `${match.name} — HONESTA`,
          description: match.tagline,
          url: `${shopUrl}?category=${match.slug}`,
          ...(match.image_url
            ? { images: [{ url: match.image_url, alt: match.name }] }
            : {}),
        },
      };
    }
  }

  return {
    title: "Shop",
    description: SHOP_DESCRIPTION,
    alternates: { canonical: shopUrl },
    openGraph: {
      title: "Shop — HONESTA",
      description: SHOP_DESCRIPTION,
      url: shopUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shop — HONESTA",
      description: SHOP_DESCRIPTION,
      images: ["/og-image.jpg"],
    },
  };
}

function ProductsSkeleton() {
  return (
    <div className="bg-cream pt-12 pb-20 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 text-center">
          <Skeleton className="h-3 w-28 mx-auto mb-4" />
          <Skeleton className="h-8 w-56 mx-auto mb-3" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
        <div className="mb-10 flex items-center gap-3">
          <Skeleton className="h-9 grow" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

async function ShopStructuredData() {
  const categories = await getCategories();
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildShopCollectionJsonLd(categories, siteUrl),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildShopBreadcrumbJsonLd(siteUrl)),
        }}
      />
    </>
  );
}

export default function ShopPage() {
  return (
    <main className="grow min-h-160">
      <TrustMarks />
      <SearchParamsFilterProvider keys={["category", "sort", "search", "mark"]}>
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsSection />
        </Suspense>
      </SearchParamsFilterProvider>
      <Suspense fallback={null}>
        <ShopStructuredData />
      </Suspense>
    </main>
  );
}
