"use client";

import { createContext, useContext, useState } from "react";

export type ViewMode = "row" | "card";

export const DEFAULT_VIEW_MODE: ViewMode = "row";

interface ViewModeContextValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx)
    throw new Error("useViewMode must be used within <ViewModeProvider>");
  return ctx;
}

export function ViewModeProvider({
  cookieKey,
  initialMode = DEFAULT_VIEW_MODE,
  children,
}: {
  cookieKey: string;
  initialMode?: ViewMode;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ViewMode>(initialMode);

  const setMode = (next: ViewMode) => {
    setModeState(next);
    document.cookie = `${cookieKey}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}
