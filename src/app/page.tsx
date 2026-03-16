import { Suspense } from "react";
import { Hero, TrustBadges, PhilosophyBlock, PartnershipCTA } from "@/sections";
import { Loader } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { CategoriesSection, ProductsSection } from "@/pages_flow/home";

export default async function Home() {
  return (
    <main className="grow min-h-160">
      <Hero />
      <TrustBadges />
      <SearchParamsFilterProvider keys={["category"]}>
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
