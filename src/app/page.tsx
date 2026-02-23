import {
  Navbar,
  Hero,
  TrustBadges,
  CategoryCards,
  ProductGrid,
  PhilosophyBlock,
  InstagramCTA,
  Footer,
} from "@/shared/sections";
import { CategoryFilterProvider } from "@/shared/providers";

export default async function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBadges />
      <CategoryFilterProvider>
        <CategoryCards />
        <ProductGrid />
      </CategoryFilterProvider>
      <PhilosophyBlock />
      <InstagramCTA />
      <Footer />
    </>
  );
}
