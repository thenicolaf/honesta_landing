export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  image_url: string | null;
  badge: string | null;
  sort_order: number;
}

export interface CategoryCard {
  id?: string;
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  image_url?: string | null;
  badge?: string | null;
  href: string;
}
