export interface DbProduct {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  image_url: string | null;
  images: string[] | null;
  in_stock: boolean | null;
  status: "draft" | "published" | "archived";
  nutrition: Record<string, { name: string; value: number }> | null;
  categories: { slug: string; name: string } | null;
  product_tags: { tag_options: { label: string } }[];
  product_free_froms: { free_from_options: { label: string } }[];
  product_serving_ideas: { serving_idea_options: { label: string } }[];
  product_occasions: { occasion_options: { label: string } }[];
  product_benefits: { benefits: { name: string; description: string } }[];
  promotion_products: {
    promotions: {
      name: string;
      discount_type: string;
      discount_value: number;
      ends_at: string;
      is_active: boolean;
      starts_at: string;
    };
  }[];
  product_variants: {
    id: string;
    weight_g: number;
    price: string;
  }[];
}

export interface CategoryItem {
  value: string;
  label: string;
}

export interface DbProductGridProps {
  rawProducts: DbProduct[];
  categories?: CategoryItem[];
}
