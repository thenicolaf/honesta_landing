"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { formatLongDate, fromDateOnlyString } from "@/shared/utils/zonedTime";
import { removeBlackoutAction } from "./actions";
import { BlackoutForm } from "./BlackoutForm";

interface BlackoutActionsContextValue {
  openCreate: () => void;
  openEdit: (blackout: DeliveryBlackout) => void;
  openDelete: (blackout: DeliveryBlackout) => void;
}

const BlackoutActionsContext =
  createContext<BlackoutActionsContextValue | null>(null);

export function useBlackoutActions() {
  const ctx = useContext(BlackoutActionsContext);
  if (!ctx)
    throw new Error(
      "useBlackoutActions must be used within <BlackoutActionsProvider>",
    );
  return ctx;
}

export function BlackoutActionsProvider({
  slots,
  children,
}: {
  slots: DeliverySlot[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DeliveryBlackout | null>(null);
  const [deleting, setDeleting] = useState<DeliveryBlackout | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const result = await removeBlackoutAction(id);
      if (result.error) {
        toastError(result.error);
        return;
      }
      toastSuccess("Blackout removed");
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <BlackoutActionsContext.Provider
      value={{
        openCreate: () => setCreating(true),
        openEdit: setEditing,
        openDelete: setDeleting,
      }}
    >
      {children}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => !open && closeForm()}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit blackout" : "Block a date"}
            </DialogTitle>
          </DialogHeader>
          {(creating || editing) && (
            <BlackoutForm
              blackout={editing}
              slots={slots}
              onClose={closeForm}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Remove blackout</DialogTitle>
            <DialogDescription>
              Remove the blackout for{" "}
              {deleting
                ? formatLongDate(fromDateOnlyString(deleting.blackout_date))
                : ""}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              as="button"
              type="button"
              variant="primary"
              color="error"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlackoutActionsContext.Provider>
  );
}
