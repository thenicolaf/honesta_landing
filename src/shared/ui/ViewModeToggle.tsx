"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { useViewMode, type ViewMode } from "@/providers/ViewModeProvider";
import { FormTileRadio, FormTileRadioItem } from "./Form/FormTileRadio";

export function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <FormTileRadio
      name="viewMode"
      size="sm"
      value={mode}
      onValueChange={(v) => setMode(v as ViewMode)}
    >
      <FormTileRadioItem value="row">
        <Rows3 size={14} aria-hidden="true" />
        <span className="sr-only">List view</span>
      </FormTileRadioItem>
      <FormTileRadioItem value="card">
        <LayoutGrid size={14} aria-hidden="true" />
        <span className="sr-only">Card view</span>
      </FormTileRadioItem>
    </FormTileRadio>
  );
}
