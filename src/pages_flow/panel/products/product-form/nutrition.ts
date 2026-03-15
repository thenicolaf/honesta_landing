export enum NutritionKey {
  Calories = "calories",
  Carbs = "carbs",
  NaturalSugars = "natural_sugars",
  AddedSugars = "added_sugars",
  Fiber = "fiber",
  Protein = "protein",
  Fat = "fat",
  VitaminC = "vitamin_c",
}

export const NUTRITION_FIELDS: { key: NutritionKey; label: string }[] = [
  { key: NutritionKey.Calories, label: "Calories" },
  { key: NutritionKey.Carbs, label: "Carbs (g)" },
  { key: NutritionKey.NaturalSugars, label: "Natural sugars (g)" },
  { key: NutritionKey.AddedSugars, label: "Added sugars (g)" },
  { key: NutritionKey.Fiber, label: "Fiber (g)" },
  { key: NutritionKey.Protein, label: "Protein (g)" },
  { key: NutritionKey.Fat, label: "Fat (g)" },
  { key: NutritionKey.VitaminC, label: "Vitamin C (mg)" },
];

export type Nutrition = Record<NutritionKey, number>;

export function buildNutrition(formData: FormData): Nutrition {
  const result = {} as Nutrition;
  for (const key of Object.values(NutritionKey)) {
    const raw = formData.get(key) as string | null;
    result[key] = parseFloat(raw ?? "") || 0;
  }
  return result;
}
