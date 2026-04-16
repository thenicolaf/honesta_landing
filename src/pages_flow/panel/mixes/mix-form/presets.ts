import type { MixBox } from "@/lib/mixBoxesDb";
import type { SectionProps } from "./shared";

export interface PresetRow {
  product_id: string;
  weight_g: number;
  price: number;
}

export function emptyRow(): PresetRow {
  return { product_id: "", weight_g: 0, price: 0 };
}

function parsePresetsJson(raw?: string): PresetRow[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((r) => ({
      product_id: typeof r?.product_id === "string" ? r.product_id : "",
      weight_g: Number(r?.weight_g) || 0,
      price: Number(r?.price) || 0,
    }));
  } catch {
    return null;
  }
}

function presetsFromMix(mix: MixBox | undefined): PresetRow[] | null {
  if (!mix?.presets || mix.presets.length === 0) return null;
  return mix.presets
    .slice()
    .sort((a, b) => {
      const nameA = a.product?.title ?? "";
      const nameB = b.product?.title ?? "";
      return nameA.localeCompare(nameB);
    })
    .map((p) => ({
      product_id: p.product_id,
      weight_g: p.weight_g,
      price: Number(p.price),
    }));
}

export function initRows(
  mix: SectionProps["mix"],
  state: SectionProps["state"],
): PresetRow[] {
  const fromState = parsePresetsJson(state?.values?.presets);
  if (fromState && fromState.length > 0) return fromState;

  const fromMix = presetsFromMix(mix);
  if (fromMix) return fromMix;

  return [emptyRow()];
}
