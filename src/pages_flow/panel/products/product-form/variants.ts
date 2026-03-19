import type { SectionProps } from "./shared";

export interface VariantRow {
  weight_g: number;
  price: number;
}

export function emptyRow(): VariantRow {
  return { weight_g: 0, price: 0 };
}

function parseVariantsJson(raw?: string): VariantRow[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function initRows(
  product: SectionProps["product"],
  state: SectionProps["state"],
): VariantRow[] {
  const fromState = parseVariantsJson(state?.values?.variants);
  if (fromState) return fromState;

  const variants = product?.product_variants;
  if (variants && variants.length > 0) {
    return variants
      .slice()
      .sort((a, b) => a.weight_g - b.weight_g)
      .map((v) => ({
        weight_g: v.weight_g,
        price: Number(v.price),
      }));
  }
  return [emptyRow()];
}
