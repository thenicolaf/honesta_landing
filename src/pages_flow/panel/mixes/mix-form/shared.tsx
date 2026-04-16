import type { MixBox, MixFormOptions } from "@/lib/mixBoxesDb";
import type { MixState } from "../actions";

export interface SectionProps {
  mix?: MixBox;
  options: MixFormOptions;
  state: MixState | null;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
      {children}
    </p>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
      {children}
    </div>
  );
}
