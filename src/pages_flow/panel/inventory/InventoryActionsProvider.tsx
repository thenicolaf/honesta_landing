"use client";

import { createContext, useContext, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui";
import type { InventoryRow } from "@/lib/inventoryDb";
import { AdjustStockForm } from "./AdjustStockForm";
import { EditInventoryForm } from "./EditInventoryForm";
import { MovementsHistory } from "./MovementsHistory";

type DialogKind = "adjust" | "settings" | "history";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

interface DialogConfig {
  title: string;
  description?: string;
  size: DialogSize;
  form: React.ReactNode;
}

interface InventoryActionsContextValue {
  open: (kind: DialogKind, row: InventoryRow) => void;
}

const InventoryActionsContext =
  createContext<InventoryActionsContextValue | null>(null);

export function useInventoryActions() {
  const ctx = useContext(InventoryActionsContext);
  if (!ctx)
    throw new Error(
      "useInventoryActions must be used within <InventoryActionsProvider>",
    );
  return ctx;
}

const DIALOG_CONFIG: Record<
  DialogKind,
  (row: InventoryRow, close: () => void) => DialogConfig
> = {
  adjust: (row, close) => ({
    title: `Adjust stock — ${row.product_title}`,
    size: "lg",
    form: <AdjustStockForm row={row} onClose={close} />,
  }),
  settings: (row, close) => ({
    title: `Inventory settings — ${row.product_title}`,
    size: "sm",
    form: <EditInventoryForm row={row} onClose={close} />,
  }),
  history: (row, close) => ({
    title: `Movements — ${row.product_title}`,
    description: "Last 50 movements (newest first).",
    size: "xl",
    form: (
      <>
        <MovementsHistory row={row} />
        <div className="mt-4 flex justify-end">
          <Button
            href={`/panel/inventory/history?product=${encodeURIComponent(row.product_id)}`}
            variant="text"
            size="sm"
            endIcon={<ArrowUpRight size={14} aria-hidden="true" />}
            onClick={close}
          >
            View all history
          </Button>
        </div>
      </>
    ),
  }),
};

export function InventoryActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [kind, setKind] = useState<DialogKind | null>(null);
  const [row, setRow] = useState<InventoryRow | null>(null);

  function close() {
    setKind(null);
    setRow(null);
  }

  const config = kind && row ? DIALOG_CONFIG[kind](row, close) : null;

  return (
    <InventoryActionsContext.Provider
      value={{
        open: (k, r) => {
          setKind(k);
          setRow(r);
        },
      }}
    >
      {children}

      <Dialog open={kind !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent size={config?.size ?? "md"}>
          {config && (
            <>
              <DialogHeader>
                <DialogTitle>{config.title}</DialogTitle>
                {config.description && (
                  <DialogDescription>{config.description}</DialogDescription>
                )}
              </DialogHeader>
              {config.form}
            </>
          )}
        </DialogContent>
      </Dialog>
    </InventoryActionsContext.Provider>
  );
}
