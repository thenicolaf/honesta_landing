import { Category } from "@/shared/types";

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
}

export interface CategoryCard {
  id?: string;
  name: Category;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  href: string;
}
