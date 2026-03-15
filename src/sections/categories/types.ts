export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  image_url: string | null;
}

export interface CategoryCard {
  id?: string;
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  image_url?: string | null;
  href: string;
}
