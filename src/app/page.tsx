import type { Metadata } from "next";
import {
  Hero,
  PhilosophyBlock,
  AboutUs,
  MixCTA,
  PartnershipCTA,
  MarketingPopupDialog,
} from "@/sections";
import { CategoryGridSkeleton } from "@/sections/categories/CategoryGridSkeleton";
import { AboutExpandedProvider } from "@/sections/about/AboutExpandedProvider";
import { Skeleton } from "@/shared/ui";
import { ProductGridSkeleton } from "@/sections/products/ProductGridSkeleton";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { CategoriesSection, ProductsSection } from "@/pages_flow/home";
import { HashTracker } from "./_components/HashTracker";
import { Suspense } from "react";
import { getCategories } from "@/lib/categoriesDb";
import { getActiveMixBoxes } from "@/lib/mixBoxesDb";
import {
  getActiveMarketingPopup,
  isMarketingPopupActive,
} from "@/lib/marketingPopupDb";
import { buildHomeStructuredData } from "./home-structured-data";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
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
        openGraph: {
          title: `${match.name} — HONESTA`,
          description: match.tagline,
          ...(match.image_url
            ? { images: [{ url: match.image_url, alt: match.name }] }
            : {}),
        },
      };
    }
  }

  return {};
}

function CategoriesSkeleton() {
  return (
    <section className="bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className="mb-10 text-center">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        <CategoryGridSkeleton count={4} />
      </div>
    </section>
  );
}

function ProductsSkeleton() {
  return (
    <section className="bg-white-warm py-20 md:py-28">
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
    </section>
  );
}

export default async function Home() {
  const [categories, activeMixBoxes, popup] = await Promise.all([
    getCategories(),
    getActiveMixBoxes(),
    getActiveMarketingPopup(),
  ]);
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const showPopup = isMarketingPopupActive(popup);

  return (
    <main className="grow min-h-160">
      <AboutExpandedProvider>
        <Hero />
        <AboutUs />
      </AboutExpandedProvider>
      <MixCTA hasActiveBoxes={activeMixBoxes.length > 0} />
      <SearchParamsFilterProvider keys={["category", "sort", "search", "mark"]}>
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsSection />
        </Suspense>
      </SearchParamsFilterProvider>
      <PhilosophyBlock />
      <PartnershipCTA />
      {showPopup && popup && (
        <MarketingPopupDialog
          id={popup.id}
          version={popup.version}
          title={popup.title}
          body={popup.body}
          image_url={popup.image_url}
          cta_label={popup.cta_label}
          cta_url={popup.cta_url}
        />
      )}
      <HashTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildHomeStructuredData(categories, siteUrl)),
        }}
      />
    </main>
  );
}
