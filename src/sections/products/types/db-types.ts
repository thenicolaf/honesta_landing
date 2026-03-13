export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  title: string;
  tagline: string | null;
  badge: string;
  price: string;
  weight_g: number | null;
  image_url: string | null;
  in_stock: boolean | null;
  nutrition: {
    calories: number;
    carbs: number;
    natural_sugars: number;
    added_sugars: number;
    fiber: number;
    protein: number;
    fat: number;
    vitamin_c?: number;
  } | null;
  categories: { slug: string } | null;
  product_tags: { tag_options: { label: string } }[];
  product_free_froms: { free_from_options: { label: string } }[];
  product_serving_ideas: { serving_idea_options: { label: string } }[];
  product_occasions: { occasion_options: { label: string } }[];
  product_benefits: { benefits: { name: string; description: string } }[];
}

export interface DbProductGridProps {
  rawProducts: DbProduct[];
}
