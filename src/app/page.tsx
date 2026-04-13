import type { Metadata } from "next";
import { Hero, PhilosophyBlock, AboutUs, PartnershipCTA } from "@/sections";
import { AboutExpandedProvider } from "@/sections/about/AboutExpandedProvider";
import { Skeleton, SkeletonProductGrid } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { CategoriesSection, ProductsSection } from "@/pages_flow/home";
import { HashTracker } from "./_components/HashTracker";
import { Suspense } from "react";
import { getCategories } from "@/lib/categoriesDb";
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
        <div className="mb-14 text-center">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
              <Skeleton className="w-full aspect-4/3 rounded-none" />
              <div className="p-6 flex flex-col gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
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
        <Skeleton className="h-9 w-full mb-10" />
        <SkeletonProductGrid count={6} />
      </div>
    </section>
  );
}

export default async function Home() {
  const categories = await getCategories();
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow min-h-160">
      <AboutExpandedProvider>
        <Hero />
        <AboutUs />
      </AboutExpandedProvider>
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
