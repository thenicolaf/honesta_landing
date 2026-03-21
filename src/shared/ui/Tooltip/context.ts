"use client";

import { createContext, useContext } from "react";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipContextValue {
  open: boolean;
  resolvedSide: TooltipSide;
  triggerId: string;
  contentId: string;
  show: () => void;
  hide: () => void;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("useTooltip must be used within <Tooltip>");
  return ctx;
}
