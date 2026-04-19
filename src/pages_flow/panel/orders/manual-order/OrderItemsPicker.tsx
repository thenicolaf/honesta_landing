"use client";

import { Trash2, Plus } from "lucide-react";
import {
  FormLabel,
  FormSelect,
  FormNumberInput,
  FormError,
  Button,
} from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import type { Product } from "@/sections/products/types/types";

export interface ItemRow {
  productId: string;
  variantId: string;
  quantity: number;
}

interface Props {
  products: Product[];
  rows: ItemRow[];
  onChange: (rows: ItemRow[]) => void;
  error?: string;
}

export function emptyRow(): ItemRow {
  return { productId: "", variantId: "", quantity: 1 };
}

export function OrderItemsPicker({ products, rows, onChange, error }: Props) {
  const productOptions = products.map((p) => ({
    value: p.id ?? "",
    label: p.category ? `${p.title} — ${p.category}` : p.title,
  }));

  function updateRow(index: number, patch: Partial<ItemRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([...rows, emptyRow()]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  // Serialize: only rows with both productId + variantId go to the server
  const serialized = JSON.stringify(
    rows
      .filter((r) => r.variantId && r.quantity > 0)
      .map((r) => ({ variantId: r.variantId, quantity: r.quantity })),
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="items" value={serialized} />

      {rows.map((row, index) => {
        const product = products.find((p) => p.id === row.productId);
        const variantOptions =
          product?.variants.map((v) => ({
            value: v.id,
            label: `${v.weight_g}g — ${formatAed(v.price)}`,
          })) ?? [];

        const labelHiddenOnDesktop = index > 0 ? "sm:hidden" : undefined;

        const trashButton = (
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            color="error"
            onClick={() => removeRow(index)}
            disabled={rows.length === 1}
            aria-label="Remove product"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        );

        return (
          <div
            key={index}
            className="relative grid grid-cols-1 sm:grid-cols-[1fr_220px_140px_auto] gap-x-3 gap-y-2 items-end pt-8 sm:pt-0"
          >
            <div className="absolute top-0 right-0 sm:hidden">
              {trashButton}
            </div>

            <div>
              <FormLabel className={labelHiddenOnDesktop}>Product</FormLabel>
              <FormSelect
                name={`__pick_product_${index}`}
                options={productOptions}
                value={row.productId}
                onValueChange={(v) =>
                  updateRow(index, { productId: v, variantId: "" })
                }
                placeholder="Select product…"
                clearable
                searchable
              />
            </div>

            <div>
              <FormLabel className={labelHiddenOnDesktop}>Variant</FormLabel>
              <FormSelect
                name={`__pick_variant_${index}`}
                options={variantOptions}
                value={row.variantId}
                onValueChange={(v) => updateRow(index, { variantId: v })}
                placeholder={
                  row.productId ? "Select variant…" : "Pick product first"
                }
                clearable
                disabled={!row.productId}
              />
            </div>

            <div>
              <FormLabel className={labelHiddenOnDesktop}>Qty</FormLabel>
              <FormNumberInput
                name={`__pick_qty_${index}`}
                value={row.quantity}
                onValueChange={(n) =>
                  updateRow(index, { quantity: Math.max(1, Math.floor(n)) })
                }
                min={1}
                step={1}
              />
            </div>

            <div className="hidden sm:flex sm:items-center sm:h-10">
              {trashButton}
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
        >
          <Plus className="w-4 h-4" />
          Add product
        </Button>
      </div>

      <FormError message={error} />
    </div>
  );
}
