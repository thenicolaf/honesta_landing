"use client";

import { Card } from "@/shared/ui";
import { ProductItem } from "@/sections/products/ProductItem";
import {
  ProductGridSkeleton,
  PRODUCT_GRID_CLASS,
} from "@/sections/products/ProductGridSkeleton";
import { useFavorites } from "@/providers";
import type { Product } from "@/sections/products/types";
import { EmptyFavorites } from "./EmptyFavorites";

export function FavoritesGrid({ allProducts }: { allProducts: Product[] }) {
  const { favorites, isHydrated } = useFavorites();

  if (!isHydrated) {
    return <ProductGridSkeleton count={6} />;
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
    <div className={PRODUCT_GRID_CLASS}>
      {visible.map((product) => (
        <ProductItem key={product.id} product={product} from="favorites" />
      ))}
    </div>
  );
}
