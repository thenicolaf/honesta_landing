import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { mapDbProducts } from "@/sections/products/utils/mapDbProducts";
import type { DbProductGridProps } from "@/sections/products/types";
import { FavoritesGrid } from "./FavoritesGrid";

export function FavoritesPage({ rawProducts }: DbProductGridProps) {
  const products = mapDbProducts(rawProducts);

  return (
    <>
      <AdminPageHeader title="Favorites" />

      <FavoritesGrid allProducts={products} />
    </>
  );
}
