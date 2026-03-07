import { AdminPageHeader } from "@/app/(admin)/_components/AdminPageHeader";
import { mapDbProducts } from "@/sections/products/utils/mapDbProducts";
import type { DbProductGridProps } from "@/sections/products/types";
import { FavoritesGrid } from "./FavoritesGrid";

type FavoritesPageProps = Omit<DbProductGridProps, "rawProducts"> & {
  rawProducts: DbProductGridProps["rawProducts"];
};

export function FavoritesPage({
  rawProducts,
  tagOptions,
  freeFromOptions,
  servingIdeaOptions,
  occasionOptions,
  benefits,
}: FavoritesPageProps) {
  const products = mapDbProducts(rawProducts, {
    tagOptions,
    freeFromOptions,
    servingIdeaOptions,
    occasionOptions,
    benefits,
  });

  return (
    <>
      <AdminPageHeader title="Favorites" />

      <FavoritesGrid allProducts={products} />
    </>
  );
}
