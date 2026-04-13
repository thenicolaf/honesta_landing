"use client";

import { Card, SkeletonProductGrid } from "@/shared/ui";
import { ProductItem } from "@/sections/products/ProductItem";
import { useFavorites } from "@/providers";
import type { Product } from "@/sections/products/types";
import { EmptyFavorites } from "./EmptyFavorites";

export function FavoritesGrid({ allProducts }: { allProducts: Product[] }) {
  const { favorites, isHydrated } = useFavorites();

  if (!isHydrated) {
    return <SkeletonProductGrid count={6} />;
  }

  const visible = allProducts.filter((p) => p.id && favorites.includes(p.id));

  if (visible.length === 0) {
    return (
      <Card className="p-8">
        <EmptyFavorites />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map((product) => (
        <ProductItem key={product.id} product={product} from="favorites" />
      ))}
    </div>
  );
}
