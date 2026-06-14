import type { Metadata } from "next";
import {
  Hero,
  PhilosophyBlock,
  MixCTA,
  MarketingPopupDialog,
  PromoSliderSkeleton,
} from "@/sections";
import { Skeleton } from "@/shared/ui";
import { ProductGridSkeleton } from "@/sections/products/ProductGridSkeleton";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductsSection, PromoSliderSection } from "@/pages_flow/home";
import { HashTracker } from "./_components/HashTracker";
import { Suspense } from "react";
import { getCategories } from "@/lib/categoriesDb";
import { getActiveMixBoxes } from "@/lib/mixBoxesDb";
import {
  getActiveMarketingPopup,
  isMarketingPopupActive,
} from "@/lib/marketingPopupDb";
import { SectionId } from "@/shared/consts/navLinks";
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

// function CategoriesSkeleton() {
//   return (
//     <section className="bg-sand py-20 md:py-28">
//       <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
//         <div className="mb-10 text-center">
//           <Skeleton className="h-3 w-20 mx-auto mb-4" />
//           <Skeleton className="h-8 w-64 mx-auto" />
//         </div>
//         <CategoryGridSkeleton count={4} />
//       </div>
//     </section>
//   );
// }

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

function MixCTASkeleton() {
  return (
    <section
      id={SectionId.Mix}
      className="noise relative bg-earth overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 bg-earth/80" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-16">
          <Skeleton className="w-full max-w-md lg:max-w-lg aspect-3/2 rounded-3xl mb-10 lg:mb-0 shrink-0 bg-white-warm/10" />
          <div className="flex flex-col items-center lg:items-start w-full max-w-lg">
            <Skeleton className="h-3 w-40 mb-5 bg-white-warm/10" />
            <Skeleton className="h-10 md:h-14 w-72 md:w-96 mb-5 bg-white-warm/10" />
            <Skeleton className="h-4 w-full max-w-md mb-2 bg-white-warm/10" />
            <Skeleton className="h-4 w-5/6 max-w-md mb-8 bg-white-warm/10" />
            <Skeleton className="h-12 w-44 rounded-full bg-white-warm/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function MixCTAAsync() {
  const activeMixBoxes = await getActiveMixBoxes();
  return <MixCTA hasActiveBoxes={activeMixBoxes.length > 0} />;
}

async function MarketingPopupAsync() {
  const popup = await getActiveMarketingPopup();
  if (!isMarketingPopupActive(popup) || !popup) return null;
  return (
    <MarketingPopupDialog
      id={popup.id}
      title={popup.title}
      body={popup.body}
      image_url={popup.image_url}
      cta_label={popup.cta_label}
      cta_url={popup.cta_url}
    />
  );
}

async function HomeStructuredDataAsync() {
  const categories = await getCategories();
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildHomeStructuredData(categories, siteUrl)),
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="grow min-h-160">
      <Hero />
      <Suspense fallback={<PromoSliderSkeleton />}>
        <PromoSliderSection />
      </Suspense>
      <SearchParamsFilterProvider keys={["category", "sort", "search", "mark"]}>
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsSection />
        </Suspense>
      </SearchParamsFilterProvider>
      <Suspense fallback={<MixCTASkeleton />}>
        <MixCTAAsync />
      </Suspense>
      <PhilosophyBlock />
      <Suspense fallback={null}>
        <MarketingPopupAsync />
      </Suspense>
      <HashTracker />
      <Suspense fallback={null}>
        <HomeStructuredDataAsync />
      </Suspense>
    </main>
  );
}
