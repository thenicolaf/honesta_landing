"use client";

import { createContext, useContext, useState } from "react";
import type { DbCategory } from "@/sections/categories/types";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

interface CategoryActionsContextValue {
  openDelete: (category: DbCategory) => void;
}

const CategoryActionsContext = createContext<CategoryActionsContextValue | null>(null);

export function useCategoryActions() {
  const ctx = useContext(CategoryActionsContext);
  if (!ctx) throw new Error("useCategoryActions must be used within <CategoryActionsProvider>");
  return ctx;
}

export function CategoryActionsProvider({ children }: { children: React.ReactNode }) {
  const [deleteCategory, setDeleteCategory] = useState<DbCategory | null>(null);

  return (
    <CategoryActionsContext.Provider
      value={{ openDelete: setDeleteCategory }}
    >
      {children}

      <DeleteCategoryDialog
        id={deleteCategory?.id ?? ""}
        name={deleteCategory?.name ?? ""}
        open={deleteCategory !== null}
        onOpenChange={(open) => { if (!open) setDeleteCategory(null); }}
      />
    </CategoryActionsContext.Provider>
  );
}
