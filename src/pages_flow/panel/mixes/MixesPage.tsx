"use client";

import { EmptyState } from "@/shared/ui";
import type { MixBox } from "@/lib/mixBoxesDb";
import { useFilteredMixes } from "./useFilteredMixes";
import { MixesToolbar } from "./MixesToolbar";
import { SortableMixGrid } from "./SortableMixGrid";

export function MixesPageInner({ mixes }: { mixes: MixBox[] }) {
  const filters = useFilteredMixes(mixes);

  return (
    <>
      <MixesToolbar filters={filters} />
      {filters.mixes.length === 0 ? (
        <EmptyState
          label="No mixes found"
          description="Try changing the filters or create a new mix."
          action={{
            label: "New Mix",
            href: "/panel/mixes/create",
            variant: "primary",
          }}
        />
      ) : (
        <SortableMixGrid mixes={filters.mixes} />
      )}
    </>
  );
}
