export interface NutritionEntry {
  key: string;
  name: string;
  value: number;
}

export const DEFAULT_NUTRITION_FIELDS: { key: string; name: string }[] = [
  { key: "calories", name: "Calories" },
  { key: "carbs", name: "Carbs (g)" },
  { key: "natural_sugars", name: "Natural sugars (g)" },
  { key: "added_sugars", name: "Added sugars (g)" },
  { key: "fiber", name: "Fiber (g)" },
  { key: "protein", name: "Protein (g)" },
  { key: "fat", name: "Fat (g)" },
  { key: "vitamin_c", name: "Vitamin C (mg)" },
];

export type NutritionJson = Record<string, { name: string; value: number }>;

export function buildNutrition(entries: NutritionEntry[]): NutritionJson {
  const result: NutritionJson = {};
  for (const { key, name, value } of entries) {
    if (key) result[key] = { name, value };
  }
  return result;
}

export function parseNutritionEntries(
  nutrition: NutritionJson | null | undefined,
): NutritionEntry[] {
  if (!nutrition) {
    return DEFAULT_NUTRITION_FIELDS.map((f) => ({ ...f, value: 0 }));
  }
  return Object.entries(nutrition).map(([key, { name, value }]) => ({
    key,
    name,
    value,
  }));
}

export function slugifyKey(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
