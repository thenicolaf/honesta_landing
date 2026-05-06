"use client";

import type { Product } from "@/sections/products/types/types";
import { OrderItemsPicker, type ItemRow } from "../OrderItemsPicker";
import { ManualOrderSection } from "./ManualOrderSection";

interface ProductsSectionProps {
  products: Product[];
  rows: ItemRow[];
  onChange: (rows: ItemRow[]) => void;
  error?: string;
}

export function ProductsSection({
  products,
  rows,
  onChange,
  error,
}: ProductsSectionProps) {
  return (
    <ManualOrderSection title="Products">
      <OrderItemsPicker
        products={products}
        rows={rows}
        onChange={onChange}
        error={error}
      />
    </ManualOrderSection>
  );
}
