"use client";

import { createContext, useContext } from "react";

export interface PopoverContextValue {
  open: boolean;
  direction: { vertical: "down" | "up"; horizontal: "left" | "right" };
  toggle: () => void;
  close: () => void;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopover() {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("usePopover must be used within <Popover>");
  return ctx;
}
