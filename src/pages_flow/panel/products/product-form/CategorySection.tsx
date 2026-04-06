import { FormLabel, FormSelect, FormError } from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

export function CategorySection({ product, options, state }: SectionProps) {
  return (
    <SectionCard>
      <SectionLabel>Category</SectionLabel>

      <div>
        <FormLabel required>Category</FormLabel>
        <FormSelect
          name="category_id"
          placeholder="Select category"
          defaultValue={
            state?.values?.category_id ?? product?.categories?.id ?? ""
          }
          options={options.categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          clearable
          state={state?.fieldErrors?.category_id ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.category_id} />
      </div>
    </SectionCard>
  );
}
