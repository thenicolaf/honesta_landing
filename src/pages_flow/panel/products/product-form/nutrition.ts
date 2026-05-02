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

export type NutritionJson = NutritionEntry[];

type LegacyNutritionObject = Record<string, { name: string; value: number }>;

export function buildNutrition(entries: NutritionEntry[]): NutritionJson {
  return entries.filter((e) => e.key).map(({ key, name, value }) => ({ key, name, value }));
}

export function parseNutritionEntries(
  nutrition: NutritionJson | LegacyNutritionObject | null | undefined,
): NutritionEntry[] {
  if (!nutrition) {
    return DEFAULT_NUTRITION_FIELDS.map((f) => ({ ...f, value: 0 }));
  }
  if (Array.isArray(nutrition)) {
    return nutrition.map(({ key, name, value }) => ({ key, name, value }));
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
