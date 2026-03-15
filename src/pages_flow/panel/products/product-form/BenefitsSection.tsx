"use client";

import { useState } from "react";
import {
  FormLabel,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
} from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

interface BenefitOption {
  id: number;
  name: string;
  description: string;
}

function toBenefitSelectOptions(benefits: BenefitOption[]) {
  return benefits.map((b) => ({ value: String(b.id), label: b.name }));
}

export function BenefitsSection({ product, options }: SectionProps) {
  const defaultIds =
    product?.product_benefits.map((pb) => String(pb.benefit_id)) ?? [];
  const [values, setValues] = useState<string[]>(defaultIds);

  const selectOptions = toBenefitSelectOptions(options.benefits);
  const descriptionMap = new Map(
    options.benefits.map((b) => [String(b.id), b.description]),
  );
  const searchValuesMap = new Map(
    options.benefits.map((b) => [String(b.id), `${b.name} ${b.description}`]),
  );

  return (
    <SectionCard>
      <SectionLabel>Benefits</SectionLabel>

      <div>
        <FormLabel>Health benefits</FormLabel>
        <input type="hidden" name="benefitIds" value={JSON.stringify(values)} />
        <MultiSelect
          value={values}
          onValueChange={setValues}
          options={selectOptions}
          clearable
        >
          <MultiSelectTrigger
            placeholder="Select benefits…"
            className="rounded-xl px-4 min-h-10 py-2 text-sm bg-cream border-parchment hover:border-orange/50 focus-visible:ring-orange/40"
          />
          <MultiSelectContent searchPlaceholder="Search benefits…">
            {(opts) => (
              <>
                {opts.map((o) => (
                  <MultiSelectItem
                    key={o.value}
                    value={o.value}
                    searchValue={`${o.label} ${descriptionMap.get(o.value) ?? ""}`}
                  >
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="truncate">{o.label}</span>
                      {descriptionMap.get(o.value) && (
                        <span className="truncate text-2xs text-earth/50">
                          {descriptionMap.get(o.value)}
                        </span>
                      )}
                    </span>
                  </MultiSelectItem>
                ))}
                <MultiSelectEmpty searchValues={searchValuesMap} />
              </>
            )}
          </MultiSelectContent>
        </MultiSelect>
      </div>
    </SectionCard>
  );
}
