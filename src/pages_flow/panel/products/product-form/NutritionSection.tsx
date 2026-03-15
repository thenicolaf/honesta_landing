import { FormLabel, FormNumberInput } from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";
import { NutritionKey, NUTRITION_FIELDS } from "./nutrition";

export function NutritionSection({ product, state }: SectionProps) {
  const nutrition = product?.nutrition;
  const resetKey = state?.values ? "s" : "d";

  return (
    <SectionCard>
      <SectionLabel>Nutrition (per 100 g)</SectionLabel>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {NUTRITION_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <FormLabel htmlFor={`p-${key}`}>{label}</FormLabel>
            <FormNumberInput
              key={`${key}-${resetKey}`}
              id={`p-${key}`}
              name={key}
              min={0}
              step={0.1}
              placeholder="0"
              defaultValue={
                state?.values?.[key as keyof typeof state.values] ??
                String(nutrition?.[key as NutritionKey] ?? 0)
              }
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
