"use client";

import type { MixBox } from "@/lib/mixBoxesDb";
import { AdminMixBuilder, type PendingMix } from "../AdminMixBuilder";
import { ManualOrderSection } from "./ManualOrderSection";

interface MixesSectionProps {
  boxes: MixBox[];
  mixes: PendingMix[];
  onChange: (mixes: PendingMix[]) => void;
}

function serializeMixes(mixes: PendingMix[]): string {
  return JSON.stringify(
    mixes.map((m) => ({ boxId: m.boxId, selections: m.selections })),
  );
}

export function MixesSection({ boxes, mixes, onChange }: MixesSectionProps) {
  return (
    <ManualOrderSection title="Mix boxes" className="bg-sand/40">
      <AdminMixBuilder boxes={boxes} mixes={mixes} onChange={onChange} />
      <input type="hidden" name="mixes" value={serializeMixes(mixes)} />
    </ManualOrderSection>
  );
}
