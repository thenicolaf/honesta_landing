import type { Metadata } from "next";
import { Hero, PhilosophyBlock, AboutUs, PartnershipCTA } from "@/sections";
import { AboutExpandedProvider } from "@/sections/about/AboutExpandedProvider";
import { Loader } from "@/shared/ui";
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
        <Suspense fallback={<Loader />}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<Loader />}>
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
