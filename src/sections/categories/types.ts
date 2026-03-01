import { Category } from "@/shared/types";
import type { BadgeVariant } from "@/sections/products/types/types";

export type { BadgeVariant };

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  badge: string;
  audience: string;
  tagline: string;
  description: string;
}

export interface CategoryCard {
  id?: string;
  name: Category;
  slug?: string;
  audience: string;
  tagline: string;
  description: string;
  badge: BadgeVariant;
  Icon: React.ComponentType<React.ComponentProps<"svg">>;
  placeholderBg: string;
  href: string;
}
