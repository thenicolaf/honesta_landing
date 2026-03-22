"use client";

import { createContext, useContext } from "react";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipContextValue {
  open: boolean;
  resolvedSide: TooltipSide;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("useTooltip must be used within <Tooltip>");
  return ctx;
}
