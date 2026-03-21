import type { Product } from "../types";

export type ProductSortKey = "" | "promotions" | "best-sellers" | "category";

interface Sortable {
  promotion?: unknown;
  totalSold?: number;
  category: string;
}

function compareBySortKey<T extends Sortable>(a: T, b: T, sortKey: ProductSortKey): number {
  switch (sortKey) {
    case "promotions":
      return (b.promotion ? 1 : 0) - (a.promotion ? 1 : 0);

    case "best-sellers":
      return (b.totalSold ?? 0) - (a.totalSold ?? 0);

    case "category":
      return a.category.localeCompare(b.category);

    default: {
      const promoDiff = (b.promotion ? 1 : 0) - (a.promotion ? 1 : 0);
      if (promoDiff !== 0) return promoDiff;
      const salesDiff = (b.totalSold ?? 0) - (a.totalSold ?? 0);
      if (salesDiff !== 0) return salesDiff;
      return a.category.localeCompare(b.category);
    }
  }
}

export function sortProducts(products: Product[], sortKey: ProductSortKey): Product[] {
  return [...products].sort((a, b) => compareBySortKey(a, b, sortKey));
}

export function sortBySortKey<T extends Sortable>(items: T[], sortKey: ProductSortKey): T[] {
  return [...items].sort((a, b) => compareBySortKey(a, b, sortKey));
}
