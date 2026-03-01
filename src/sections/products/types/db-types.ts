export interface LabelOption {
  id: number;
  label: string;
}

export interface DbBenefit {
  id: number;
  name: string;
  description: string;
}

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
  tag_ids: number[] | null;
  free_from_ids: number[] | null;
  serving_idea_ids: number[] | null;
  occasion_ids: number[] | null;
  benefit_ids: number[] | null;
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
}

export interface DbProductGridProps {
  rawProducts: DbProduct[];
  tagOptions: LabelOption[];
  freeFromOptions: LabelOption[];
  servingIdeaOptions: LabelOption[];
  occasionOptions: LabelOption[];
  benefits: DbBenefit[];
}
