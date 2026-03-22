"use client";

import { createContext, useContext } from "react";

export interface DataCardContextValue {
  /** Show dividers between fields */
  dividers: boolean;
}

export const DataCardContext = createContext<DataCardContextValue | null>(null);

export function useDataCard(): DataCardContextValue {
  const ctx = useContext(DataCardContext);
  if (!ctx) throw new Error("useDataCard must be used within <DataCard>");
  return ctx;
}
