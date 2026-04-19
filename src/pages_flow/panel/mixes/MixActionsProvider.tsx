"use client";

import { createContext, useContext, useState } from "react";
import type { MixBox } from "@/lib/mixBoxesDb";
import { DeleteMixDialog } from "./DeleteMixDialog";

interface MixActionsContextValue {
  openDelete: (mix: MixBox) => void;
}

const MixActionsContext = createContext<MixActionsContextValue | null>(null);

export function useMixActions() {
  const ctx = useContext(MixActionsContext);
  if (!ctx)
    throw new Error("useMixActions must be used within <MixActionsProvider>");
  return ctx;
}

export function MixActionsProvider({ children }: { children: React.ReactNode }) {
  const [deleteMix, setDeleteMix] = useState<MixBox | null>(null);

  return (
    <MixActionsContext.Provider value={{ openDelete: setDeleteMix }}>
      {children}

      <DeleteMixDialog
        id={deleteMix?.id ?? ""}
        name={deleteMix?.name ?? ""}
        open={deleteMix !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteMix(null);
        }}
      />
    </MixActionsContext.Provider>
  );
}
