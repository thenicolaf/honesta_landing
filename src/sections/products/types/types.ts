export interface NutritionField {
  name: string;
  value: number;
}

export type NutritionInfo = Record<string, NutritionField>;

export interface Benefit {
  name: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  weight_g: number;
  price: number;
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
  /** All product images (ordered), image_url = images[0] */
  images: string[];
  /** Default price (from smallest variant) — required for cart and checkout */
  price?: number;
  /** Default weight (from smallest variant) */
  weight_g?: number;
  /** Weight/price variants, sorted by weight_g ASC */
  variants: ProductVariant[];
  /** Product availability; treated as true when absent */
  in_stock?: boolean;
  // Rich data — stored for future modal / detail expansion
  benefits?: Benefit[];
  badge?: string;
  nutrition?: NutritionInfo;
  servingIdeas?: string[];
  occasions?: string[];
  /** Total units sold (from paid orders) */
  totalSold?: number;
  /** Active promotion applied to this product */
  promotion?: {
    name: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountedPrice: number;
    endsAt: string;
  };
}

/** Cart item — keyed by variantId (product_variants.id) */
export interface CartItem {
  /** product_variants.id — unique key in cart */
  variantId: string;
  /** products.id — for UI links and promotion lookup */
  productId: string;
  /** Snapshot of Product.title */
  name: string;
  /** Variant price (discounted if promotion active) */
  price: number;
  /** Variant base price before discount — computed from promotion, not stored in DB */
  originalPrice?: number;
  /** ISO date string — when the active promotion ends */
  promotionEndsAt?: string;
  quantity: number;
  image_url?: string;
  /** variant.weight_g */
  weight_g: number;
}
