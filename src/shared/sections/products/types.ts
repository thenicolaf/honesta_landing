import { Category } from "@/shared/types";

export type BadgeVariant = "natural" | "warm" | "outline";

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
  /** Matches image filename exactly, e.g. "DRIED APPLE" → /images/products/DRIED APPLE.PNG */
  name: string;
  /** Marketing display name shown as card heading, e.g. "Natural Apple Snack" */
  title: string;
  category: Category;
  badge: BadgeVariant;
  /** Short text shown in hover overlay */
  tagline: string;
  /** Key highlight chips, 3–5 items */
  tags: string[];
  /** Allergen / additive free-from list, e.g. ["added sugar", "preservatives"] */
  freeFrom: string[];
  image: string;
  // Rich data — stored for future modal / detail expansion
  benefits?: Benefit[];
  nutrition?: NutritionInfo;
  servingIdeas?: string[];
  occasions?: string[];
}
