"use client";

import { Card } from "@/shared/ui";
import { ProductItem } from "@/sections/products/ProductItem";
import { ProductItemRow } from "@/sections/products/ProductItemRow";
import {
  ProductGridSkeleton,
  PUBLIC_PRODUCT_GRID_CLASS,
} from "@/sections/products/ProductGridSkeleton";
import { useFavorites } from "@/providers";
import { useViewMode } from "@/providers/ViewModeProvider";
import type { Product } from "@/sections/products/types";
import { EmptyFavorites } from "./EmptyFavorites";

export function FavoritesGrid({ allProducts }: { allProducts: Product[] }) {
  const { favorites, isHydrated } = useFavorites();
  const { mode } = useViewMode();

  if (!isHydrated) {
    return <ProductGridSkeleton mode={mode} variant="public" count={6} />;
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
    <div className={PUBLIC_PRODUCT_GRID_CLASS[mode]}>
      {visible.map((product) =>
        mode === "row" ? (
          <ProductItemRow
            key={product.id}
            product={product}
            from="favorites"
          />
        ) : (
          <ProductItem key={product.id} product={product} from="favorites" />
        ),
      )}
    </div>
  );
}
