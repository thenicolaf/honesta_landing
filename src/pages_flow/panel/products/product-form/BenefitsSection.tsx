"use client";

import { useState } from "react";
import {
  Button,
  FormLabel,
  FormInput,
  FormTextarea,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
  MultiSelectDelete,
  useMultiSelect,
} from "@/shared/ui";
import { PopoverContent } from "@/shared/ui/Popover";
import { Popover } from "@/shared/ui/Popover";
import { usePopover } from "@/shared/ui/Popover";
import { IconPlus } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";
import type { MultiSelectOption } from "@/shared/ui/MultiSelect";

interface BenefitOption {
  id: number;
  name: string;
  description: string;
}

function toBenefitSelectOptions(
  benefits: BenefitOption[],
): MultiSelectOption[] {
  return benefits.map((b) => ({ value: String(b.id), label: b.name }));
}

// ─── API ────────────────────────────────────────────────────────────────────

async function createBenefitApi(name: string, description: string) {
  const res = await fetch("/api/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType: "benefits", name, description }),
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    id: number;
    name: string;
    description: string;
  };
}

async function deleteBenefitApi(id: string) {
  const res = await fetch("/api/options", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType: "benefits", id: Number(id) }),
  });
  return res.ok;
}

// ─── BenefitCreateButton (inside MultiSelectContent) ────────────────────────

function BenefitCreateButton({ onOpen }: { onOpen: (name: string) => void }) {
  const { search, options } = useMultiSelect();

  const trimmed = search.trim();
  if (!trimmed) return null;

  const exists = options.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) return null;

  return (
    <li
      role="option"
      aria-selected={false}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(trimmed);
      }}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5",
        "font-body text-sm cursor-pointer select-none",
        "text-orange hover:bg-earth/4 transition-colors duration-150",
      )}
    >
      <IconPlus className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">Create &ldquo;{trimmed}&rdquo;</span>
    </li>
  );
}

// ─── BenefitForm (inside PopoverContent) ────────────────────────────────────

function BenefitForm({
  defaultName,
  saving,
  onSave,
}: {
  defaultName: string;
  saving: boolean;
  onSave: (name: string, description: string) => Promise<void>;
}) {
  const { close } = usePopover();
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");

  const canSave = name.trim() && description.trim();
  const handleSave = async () => {
    await onSave(name.trim(), description.trim());
    close();
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <FormLabel htmlFor="benefit-name">Name</FormLabel>
        <FormInput
          id="benefit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Benefit name"
        />
      </div>
      <div>
        <FormLabel htmlFor="benefit-description">Description</FormLabel>
        <FormTextarea
          id="benefit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={2}
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
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── BenefitsSection ────────────────────────────────────────────────────────

export function BenefitsSection({ product, options }: SectionProps) {
  const defaultIds =
    product?.product_benefits.map((pb) => String(pb.benefit_id)) ?? [];
  const [values, setValues] = useState<string[]>(defaultIds);
  const [localBenefits, setLocalBenefits] = useState<BenefitOption[]>(
    options.benefits,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const selectOptions = toBenefitSelectOptions(localBenefits);
  const descriptionMap = new Map(
    localBenefits.map((b) => [String(b.id), b.description]),
  );
  const searchValuesMap = new Map(
    localBenefits.map((b) => [String(b.id), `${b.name} ${b.description}`]),
  );

  const handleCreate = async (name: string, description: string) => {
    const tempId = -Date.now();
    const tempValue = String(tempId);
    const tempBenefit: BenefitOption = { id: tempId, name, description };

    setLocalBenefits((prev) => [...prev, tempBenefit]);
    setValues((prev) => [...prev, tempValue]);

    const real = await createBenefitApi(name, description);

    if (real) {
      setLocalBenefits((prev) => prev.map((b) => (b.id === tempId ? real : b)));
      setValues((prev) =>
        prev.map((v) => (v === tempValue ? String(real.id) : v)),
      );
      return true;
    }

    setLocalBenefits((prev) => prev.filter((b) => b.id !== tempId));
    setValues((prev) => prev.filter((v) => v !== tempValue));
    return false;
  };

  const handleDelete = async (optionValue: string) => {
    const prevBenefits = localBenefits;
    const prevValues = values;

    setDeletingId(optionValue);
    setLocalBenefits((prev) =>
      prev.filter((b) => String(b.id) !== optionValue),
    );
    setValues((prev) => prev.filter((v) => v !== optionValue));

    const ok = await deleteBenefitApi(optionValue);
    setDeletingId(null);

    if (!ok) {
      setLocalBenefits(prevBenefits);
      setValues(prevValues);
    }
  };

  function handleOpenForm(name: string) {
    setFormName(name);
    setFormOpen(true);
  }

  async function handleSave(name: string, description: string) {
    setSaving(true);
    try {
      await handleCreate(name, description);
    } finally {
      setSaving(false);
    }
  }

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
                    <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="truncate">{o.label}</span>
                      {descriptionMap.get(o.value) && (
                        <span className="truncate text-2xs text-earth/50">
                          {descriptionMap.get(o.value)}
                        </span>
                      )}
                    </span>
                    <MultiSelectDelete
                      value={o.value}
                      deleting={deletingId === o.value}
                      onDelete={handleDelete}
                    />
                  </MultiSelectItem>
                ))}
                <MultiSelectEmpty searchValues={searchValuesMap} />
                <BenefitCreateButton onOpen={handleOpenForm} />
              </>
            )}
          </MultiSelectContent>

          {/* Popover form floats outside MultiSelectContent */}
          <Popover open={formOpen} onOpenChange={setFormOpen} className="block">
            <PopoverContent align="left" width="w-full">
              <BenefitForm
                key={formName}
                defaultName={formName}
                saving={saving}
                onSave={handleSave}
              />
            </PopoverContent>
          </Popover>
        </MultiSelect>
      </div>
    </SectionCard>
  );
}
