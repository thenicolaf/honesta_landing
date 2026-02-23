"use client";

import { createContext, useContext, useState } from "react";
import type { Category } from "@/shared/types";

type CategoryFilter = Category | "";

interface CategoryFilterContextValue {
  activeCategory: CategoryFilter;
  setActiveCategory: (category: CategoryFilter) => void;
}

const CategoryFilterContext = createContext<CategoryFilterContextValue | null>(null);

export function CategoryFilterProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("");

  return (
    <CategoryFilterContext value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryFilterContext>
  );
}

export function useCategoryFilter(): CategoryFilterContextValue {
  const ctx = useContext(CategoryFilterContext);
  if (!ctx) throw new Error("useCategoryFilter must be used within CategoryFilterProvider");
  return ctx;
}
