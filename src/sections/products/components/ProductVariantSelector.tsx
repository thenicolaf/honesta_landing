"use client";

import { FormTileRadio, FormTileRadioItem } from "@/shared/ui";
import type { ProductVariant } from "../types";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: "sm" | "md";
}

export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
  size = "md",
}: ProductVariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <FormTileRadio
      name="variant"
      value={selectedId}
      onValueChange={onSelect}
      size={size}
      className="flex-wrap"
    >
      {variants.map((v) => (
        <FormTileRadioItem key={v.id} value={v.id}>
          {v.weight_g}g
        </FormTileRadioItem>
      ))}
    </FormTileRadio>
  );
}
