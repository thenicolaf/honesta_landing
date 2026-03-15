export interface NutritionInfo {
  calories: number;
  carbs: number;
  naturalSugars: number;
  addedSugars: number;
  fiber: number;
  protein: number;
  fat: number;
  vitaminC?: number;
}

export interface Benefit {
  name: string;
  description: string;
}

export interface Product {
  /** Supabase UUID — present when loaded from DB, absent for static data */
  id?: string;
  /** URL-safe slug, e.g. "dried-apple" — used in routing and Supabase queries */
  slug?: string;
  /** Marketing display name shown as card heading, e.g. "Natural Apple Snack" */
  title: string;
  category: string;
  /** Short text shown in hover overlay */
  tagline: string;
  /** Key highlight chips, 3–5 items */
  tags: string[];
  /** Allergen / additive free-from list, e.g. ["added sugar", "preservatives"] */
  freeFrom: string[];
  /** URL to Supabase Storage, e.g. "https://….supabase.co/storage/v1/object/public/…" */
  image_url: string;
  /** Price in AED — required for cart and checkout */
  price?: number;
  /** Net weight of the package in grams */
  weight_g?: number;
  /** Product availability; treated as true when absent */
  in_stock?: boolean;
  // Rich data — stored for future modal / detail expansion
  benefits?: Benefit[];
  nutrition?: NutritionInfo;
  servingIdeas?: string[];
  occasions?: string[];
}

/** Cart item stored in localStorage["cart"] — name maps to Product.title */
export interface CartItem {
  id: string;
  /** Display name — snapshot of Product.title at time of adding to cart */
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}
