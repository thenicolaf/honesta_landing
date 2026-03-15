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
  name: string;
  slug: string;
  audience: string;
  tagline: string;
  description: string;
  href: string;
}
