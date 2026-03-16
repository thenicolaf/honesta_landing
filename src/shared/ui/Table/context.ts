"use client";

import { createContext, useContext } from "react";
import type { SortState } from "./types";

export interface TableContextValue<K extends string = string> {
  sort: SortState<K> | null;
  onSort: (key: K) => void;
  striped: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableContext = createContext<TableContextValue<any> | null>(null);

export function useTable<K extends string = string>(): TableContextValue<K> {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTable must be used within <Table>");
  return ctx as TableContextValue<K>;
}
