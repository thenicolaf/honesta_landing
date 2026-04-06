import type { Product } from "../types";

export type ProductSortKey = "" | "promotions" | "best_sellers" | "new";

interface Sortable {
  promotion?: unknown;
  mark?: "standard" | "best_seller" | "new";
  category: string;
}

function compareBySortKey<T extends Sortable>(a: T, b: T, sortKey: ProductSortKey): number {
  switch (sortKey) {
    case "promotions":
      return (b.promotion ? 1 : 0) - (a.promotion ? 1 : 0);

    case "best_sellers":
      return (b.mark === "best_seller" ? 1 : 0) - (a.mark === "best_seller" ? 1 : 0);

    case "new":
      return (b.mark === "new" ? 1 : 0) - (a.mark === "new" ? 1 : 0);

    default:
      return a.category.localeCompare(b.category);
  }
}

export function sortProducts(products: Product[], sortKey: ProductSortKey): Product[] {
  return [...products].sort((a, b) => compareBySortKey(a, b, sortKey));
}

export function sortBySortKey<T extends Sortable>(items: T[], sortKey: ProductSortKey): T[] {
  return [...items].sort((a, b) => compareBySortKey(a, b, sortKey));
}
