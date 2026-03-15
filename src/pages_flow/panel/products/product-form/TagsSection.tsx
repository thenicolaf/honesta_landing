import { FormLabel, FormMultiSelect } from "@/shared/ui";
import { SectionCard, SectionLabel, toSelectOptions, type SectionProps } from "./shared";

export function TagsSection({ product, options }: SectionProps) {
  return (
    <SectionCard>
      <SectionLabel>Tags &amp; Labels</SectionLabel>

      <div>
        <FormLabel>Tags</FormLabel>
        <FormMultiSelect
          name="tagIds"
          placeholder="Select tags…"
          searchPlaceholder="Search tags…"
          defaultValue={
            product?.product_tags.map((pt) => String(pt.tag_id)) ?? []
          }
          options={toSelectOptions(options.tagOptions)}
          clearable
          mode="manageable"
          entityType="tags"
        />
      </div>

      <div>
        <FormLabel>Free From</FormLabel>
        <FormMultiSelect
          name="freeFromIds"
          placeholder="Select free-from options…"
          searchPlaceholder="Search…"
          defaultValue={
            product?.product_free_froms.map((pf) =>
              String(pf.free_from_id),
            ) ?? []
          }
          options={toSelectOptions(options.freeFromOptions)}
          clearable
          mode="manageable"
          entityType="free_from"
        />
      </div>

      <div>
        <FormLabel>Occasions</FormLabel>
        <FormMultiSelect
          name="occasionIds"
          placeholder="Select occasions…"
          searchPlaceholder="Search…"
          defaultValue={
            product?.product_occasions.map((po) => String(po.occasion_id)) ??
            []
          }
          options={toSelectOptions(options.occasionOptions)}
          clearable
          mode="manageable"
          entityType="occasions"
        />
      </div>

      <div>
        <FormLabel>Serving Ideas</FormLabel>
        <FormMultiSelect
          name="servingIdeaIds"
          placeholder="Select serving ideas…"
          searchPlaceholder="Search…"
          defaultValue={
            product?.product_serving_ideas.map((ps) =>
              String(ps.serving_idea_id),
            ) ?? []
          }
          options={toSelectOptions(options.servingIdeaOptions)}
          clearable
          mode="manageable"
          entityType="serving_ideas"
        />
      </div>
    </SectionCard>
  );
}
