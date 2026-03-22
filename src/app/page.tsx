import { Hero, TrustBadges, PhilosophyBlock, PartnershipCTA } from "@/sections";
import { Loader } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { CategoriesSection, ProductsSection } from "@/pages_flow/home";
import { HashTracker } from "./_components/HashTracker";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="grow min-h-160">
      <HashTracker />
      <Hero />
      <TrustBadges />
      <SearchParamsFilterProvider keys={["category", "sort"]}>
        <Suspense fallback={<Loader />}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<Loader />}>
          <ProductsSection />
        </Suspense>
      </SearchParamsFilterProvider>
      <PhilosophyBlock />
      <PartnershipCTA />
    </main>
  );
}
