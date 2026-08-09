import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/ui";
import { ProductGridSkeleton } from "@/sections/products/ProductGridSkeleton";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductsSection } from "@/pages_flow/shop";
import { TrustMarks } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { getCategorySeo } from "./categorySeo";
import {
  buildShopCollectionJsonLd,
  buildShopBreadcrumbJsonLd,
} from "./structured-data";

const SHOP_TITLE = "Shop Premium Natural Foods in UAE | HONESTA";
const SHOP_DESCRIPTION =
  "Shop HONESTA dried fruits, fruit rolls, dried vegetables, ghee, jerky and gift selections, carefully made in the UAE.";

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
      const seo = getCategorySeo(match.slug);
      const title = seo ? seo.title : `${match.name} — HONESTA`;
      const description =
        seo?.description ||
        match.description ||
        `${match.name}. ${match.tagline}. Natural dried fruits by HONESTA.`;
      return {
        title: { absolute: title },
        description,
        alternates: { canonical: `${siteUrl}/shop/${match.slug}` },
        openGraph: {
          title,
          description: seo?.description || match.tagline,
          url: `${siteUrl}/shop/${match.slug}`,
          ...(match.image_url
            ? { images: [{ url: match.image_url, alt: match.name }] }
            : {}),
        },
      };
    }
  }

  return {
    title: { absolute: SHOP_TITLE },
    description: SHOP_DESCRIPTION,
    alternates: { canonical: shopUrl },
    openGraph: {
      title: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      url: shopUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      images: ["/og-image.webp"],
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
