"use client";

import { createContext, useContext, useState } from "react";
import type { AdminDbProduct } from "@/lib/productsDb";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface ProductActionsContextValue {
  openDelete: (product: AdminDbProduct) => void;
}

const ProductActionsContext = createContext<ProductActionsContextValue | null>(null);

export function useProductActions() {
  const ctx = useContext(ProductActionsContext);
  if (!ctx)
    throw new Error("useProductActions must be used within <ProductActionsProvider>");
  return ctx;
}

interface ProductActionsProviderProps {
  children: React.ReactNode;
}

export function ProductActionsProvider({ children }: ProductActionsProviderProps) {
  const [deleteProduct, setDeleteProduct] = useState<AdminDbProduct | null>(null);

  return (
    <ProductActionsContext.Provider
      value={{ openDelete: setDeleteProduct }}
    >
      {children}

      <DeleteProductDialog
        id={deleteProduct?.id ?? ""}
        name={deleteProduct?.title ?? ""}
        open={deleteProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null);
        }}
      />
    </ProductActionsContext.Provider>
  );
}
