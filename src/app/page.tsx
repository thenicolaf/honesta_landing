import {
  Hero,
  PhilosophyBlock,
  MixCTA,
  MarketingPopupDialog,
  PromoSliderSkeleton,
} from "@/sections";
import { Skeleton } from "@/shared/ui";
import { PromoSliderSection } from "@/pages_flow/home";
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
        <PromoSliderSection title="Best Offers" kicker="Top picks & deals" />
      </Suspense>
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
