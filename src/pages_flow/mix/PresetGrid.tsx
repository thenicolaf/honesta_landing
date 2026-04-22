"use client";

import type { MixPreset } from "@/lib/mixBoxesDb";
import { PresetCard } from "./PresetCard";

interface PresetGridProps {
  presets: MixPreset[];
  counts: Map<string, number>;
  canAdd: boolean;
  onAdd: (presetId: string) => void;
  onRemove: (presetId: string) => void;
}

export function PresetGrid({
  presets,
  counts,
  canAdd,
  onAdd,
  onRemove,
}: PresetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          count={counts.get(preset.id) ?? 0}
          canAdd={canAdd}
          onAdd={() => onAdd(preset.id)}
          onRemove={() => onRemove(preset.id)}
        />
      ))}
    </div>
  );
}
