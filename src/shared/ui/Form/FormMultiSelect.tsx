"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
  MultiSelectCreate,
  MultiSelectDelete,
} from "../MultiSelect";
import type { MultiSelectOption } from "../MultiSelect";

// ─── API helpers ─────────────────────────────────────────────────────────────

async function createOption(entityType: string, label: string) {
  const res = await fetch("/api/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType, label }),
  });
  if (!res.ok) return null;
  const data: { id: number; label: string } = await res.json();
  return { value: String(data.id), label: data.label };
}

async function deleteOption(entityType: string, id: string) {
  const res = await fetch("/api/options", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType, id: Number(id) }),
  });
  return res.ok;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function normalizeOptions(
  options: FormMultiSelectOption[],
): MultiSelectOption[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type FormMultiSelectOption = string | { value: string; label: string };

interface FormMultiSelectProps {
  id?: string;
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  options: FormMultiSelectOption[];
  state?: "default" | "error";
  clearable?: boolean;
  className?: string;
  mode?: "default" | "manageable";
  entityType?: string;
}

export function FormMultiSelect({
  id,
  name,
  defaultValue = [],
  placeholder = "Select…",
  searchPlaceholder,
  options,
  state,
  clearable = false,
  className,
  mode = "default",
  entityType,
}: FormMultiSelectProps) {
  const [values, setValues] = useState<string[]>(defaultValue);
  const [localOptions, setLocalOptions] = useState<MultiSelectOption[]>(() =>
    normalizeOptions(options),
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isManageable = mode === "manageable" && entityType;

  const handleCreate = async (label: string) => {
    // Optimistic: add temp option + select it
    const tempId = `__temp_${Date.now()}`;
    const tempOption = { value: tempId, label };
    setLocalOptions((prev) => [...prev, tempOption]);
    setValues((prev) => [...prev, tempId]);

    const real = await createOption(entityType!, label);

    if (real) {
      // Replace temp with real
      setLocalOptions((prev) =>
        prev.map((o) => (o.value === tempId ? real : o)),
      );
      setValues((prev) =>
        prev.map((v) => (v === tempId ? real.value : v)),
      );
      return real;
    }

    // Rollback
    setLocalOptions((prev) => prev.filter((o) => o.value !== tempId));
    setValues((prev) => prev.filter((v) => v !== tempId));
    return null;
  };

  const handleDelete = async (optionValue: string) => {
    // Snapshot for rollback
    const prevOptions = localOptions;
    const prevValues = values;

    // Optimistic: remove immediately
    setDeletingId(optionValue);
    setLocalOptions((prev) => prev.filter((o) => o.value !== optionValue));
    setValues((prev) => prev.filter((v) => v !== optionValue));

    const ok = await deleteOption(entityType!, optionValue);
    setDeletingId(null);

    if (!ok) {
      // Rollback
      setLocalOptions(prevOptions);
      setValues(prevValues);
    }
  };

  return (
    <div className={className}>
      <input type="hidden" id={id} name={name} value={JSON.stringify(values)} />
      <MultiSelect
        value={values}
        onValueChange={setValues}
        options={localOptions}
        clearable={clearable}
      >
        <MultiSelectTrigger
          placeholder={placeholder}
          className={cn(
            "rounded-xl px-4 min-h-10 py-2 text-sm bg-cream",
            state === "error"
              ? "border-red-400 focus-visible:ring-red-300/40"
              : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
          )}
        />
        <MultiSelectContent searchPlaceholder={searchPlaceholder}>
          {(opts) => (
            <>
              {opts.map((o) => (
                <MultiSelectItem
                  key={o.value}
                  value={o.value}
                  searchValue={o.label}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {isManageable && (
                    <MultiSelectDelete
                      value={o.value}
                      deleting={deletingId === o.value}
                      onDelete={handleDelete}
                    />
                  )}
                </MultiSelectItem>
              ))}
              <MultiSelectEmpty />
              {isManageable && (
                <MultiSelectCreate onCreate={handleCreate} />
              )}
            </>
          )}
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
