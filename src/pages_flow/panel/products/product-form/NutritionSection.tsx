"use client";

import { useState } from "react";
import { Button, FormLabel, FormInput, FormNumberInput } from "@/shared/ui";
import { Popover, PopoverContent, usePopover } from "@/shared/ui/Popover";
import { IconPlus, IconX } from "@/shared/icons";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";
import {
  buildNutrition,
  parseNutritionEntries,
  slugifyKey,
  type NutritionEntry,
} from "./nutrition";

// ─── Add Field Form (inside Popover) ────────────────────────────────────────

function AddFieldForm({
  onAdd,
  existingKeys,
}: {
  onAdd: (entry: NutritionEntry) => void;
  existingKeys: Set<string>;
}) {
  const { close } = usePopover();
  const [name, setName] = useState("");
  const [value, setValue] = useState(0);

  const key = slugifyKey(name);
  const duplicate = key ? existingKeys.has(key) : false;
  const canSave = name.trim() && !duplicate;

  function handleSave() {
    onAdd({ key, name: name.trim(), value });
    close();
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <FormLabel htmlFor="nutrition-new-name">Field name</FormLabel>
        <FormInput
          id="nutrition-new-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. "Sodium (mg)"'
          state={duplicate ? "error" : "default"}
        />
        {duplicate && (
          <p className="text-2xs text-red-500 mt-1">Field already exists</p>
        )}
      </div>
      <div>
        <FormLabel htmlFor="nutrition-new-value">Value (optional)</FormLabel>
        <FormNumberInput
          id="nutrition-new-value"
          name="_nutrition_new_value"
          value={value}
          onValueChange={setValue}
          placeholder="0"
          min={0}
          step={0.1}
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button
          as="button"
          type="button"
          variant="text"
          size="sm"
          onClick={() => close()}
        >
          Cancel
        </Button>
        <Button
          as="button"
          type="button"
          variant="primary"
          size="sm"
          disabled={!canSave}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── NutritionSection ───────────────────────────────────────────────────────

export function NutritionSection({ product }: SectionProps) {
  const [entries, setEntries] = useState<NutritionEntry[]>(() =>
    parseNutritionEntries(product?.nutrition),
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  const existingKeys = new Set(entries.map((e) => e.key));

  function updateValue(key: string, value: number) {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, value } : e)),
    );
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e.key !== key));
  }

  function addEntry(entry: NutritionEntry) {
    setEntries((prev) => [...prev, entry]);
  }

  const nutritionJson = buildNutrition(entries);

  return (
    <SectionCard>
      <SectionLabel>Nutrition (per 100 g)</SectionLabel>

      <input
        type="hidden"
        name="nutrition"
        value={JSON.stringify(nutritionJson)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map((entry) => (
          <div key={entry.key} className="relative group">
            <FormLabel htmlFor={`p-${entry.key}`}>{entry.name}</FormLabel>
            <FormNumberInput
              id={`p-${entry.key}`}
              name={`_n_${entry.key}`}
              min={0}
              step={0.1}
              placeholder="0"
              value={entry.value}
              onValueChange={(v) => updateValue(entry.key, v)}
            />
            <Button
              as="button"
              type="button"
              variant="outline"
              size="icon"
              color="error"
              onClick={() => removeEntry(entry.key)}
              className="absolute -top-1 -right-1 p-0.5 size-5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-150"
              aria-label={`Remove ${entry.name}`}
            >
              <IconX className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} className="self-start">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPopoverOpen(true)}
          className="self-start"
        >
          <IconPlus className="w-3.5 h-3.5" />
          Add field
        </Button>
        <PopoverContent align="left" width="w-72">
          {popoverOpen && (
            <AddFieldForm
              key={entries.length}
              onAdd={addEntry}
              existingKeys={existingKeys}
            />
          )}
        </PopoverContent>
      </Popover>
    </SectionCard>
  );
}
