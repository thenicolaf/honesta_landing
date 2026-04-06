import { FormLabel, FormMultiSelect, FormError } from "@/shared/ui";
import {
  SectionCard,
  SectionLabel,
  toSelectOptions,
  type SectionProps,
} from "./shared";

export function IngredientsSection({ product, options, state }: SectionProps) {
  return (
    <SectionCard>
      <SectionLabel>Ingredients</SectionLabel>

      <div>
        <FormLabel required>Ingredients</FormLabel>
        <FormMultiSelect
          name="ingredientIds"
          placeholder="Select ingredients…"
          searchPlaceholder="Search ingredients…"
          defaultValue={
            product?.product_ingredients.map((pi) =>
              String(pi.ingredient_id),
            ) ?? []
          }
          options={toSelectOptions(options.ingredientOptions)}
          clearable
          mode="manageable"
          entityType="ingredients"
          state={state?.fieldErrors?.ingredientIds ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.ingredientIds} />
      </div>
    </SectionCard>
  );
}
