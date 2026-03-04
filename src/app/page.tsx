import { Suspense } from "react";
import { Hero, TrustBadges, PhilosophyBlock, PartnershipCTA } from "@/sections";
import { CategoryFilterProvider } from "@/providers";
import { Loader } from "@/shared/ui";
import { CategoriesSection, ProductsSection } from "@/pages_flow/home";

export default function Home() {
  return (
    <main className="grow">
      <Hero />
      <TrustBadges />
      <CategoryFilterProvider>
        <Suspense fallback={<Loader />}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<Loader />}>
          <ProductsSection />
        </Suspense>
      </CategoryFilterProvider>
      <PhilosophyBlock />
      <PartnershipCTA />
    </main>
  );
}
