"use client";

import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormNumberInput,
  FormCheckbox,
  FormUploadZone,
  FormError,
} from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

export function BasicInfoSection({ mix, state }: SectionProps) {
  return (
    <SectionCard>
      <SectionLabel>Mix info</SectionLabel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormLabel htmlFor="mix-name" required>
            Name
          </FormLabel>
          <FormInput
            id="mix-name"
            name="name"
            placeholder="e.g. Classic 9-cell mix"
            defaultValue={state?.values?.name ?? mix?.name ?? ""}
            state={state?.fieldErrors?.name ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.name} />
        </div>

        <div className="sm:col-span-2">
          <FormLabel htmlFor="mix-description">Description</FormLabel>
          <FormTextarea
            id="mix-description"
            name="description"
            rows={3}
            placeholder="Short description of the mix box…"
            defaultValue={
              state?.values?.description ?? mix?.description ?? ""
            }
          />
        </div>

        <div>
          <FormLabel htmlFor="mix-cell-count" required>
            Cell count
          </FormLabel>
          <FormNumberInput
            id="mix-cell-count"
            name="cell_count"
            min={1}
            max={50}
            step={1}
            placeholder="e.g. 9"
            defaultValue={
              state?.values?.cell_count !== undefined
                ? Number(state.values.cell_count)
                : (mix?.cell_count ?? 9)
            }
            state={state?.fieldErrors?.cell_count ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.cell_count} />
        </div>

        <div className="sm:col-span-2">
          <FormLabel>Image</FormLabel>
          <FormUploadZone
            name="image_url"
            multiple={false}
            initialUrl={mix?.image_url ?? undefined}
            slug="mix"
            bucket="mixes"
          />
        </div>

        <div className="sm:col-span-2">
          <FormCheckbox
            name="is_active"
            label="Active"
            defaultChecked={mix?.is_active ?? true}
          />
        </div>
      </div>
    </SectionCard>
  );
}
