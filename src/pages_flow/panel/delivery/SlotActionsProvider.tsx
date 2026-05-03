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
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { deleteSlotAction } from "./actions";
import { SlotForm } from "./SlotForm";

interface SlotActionsContextValue {
  openCreate: () => void;
  openEdit: (slot: DeliverySlot) => void;
  openDelete: (slot: DeliverySlot) => void;
}

const SlotActionsContext = createContext<SlotActionsContextValue | null>(null);

export function useSlotActions() {
  const ctx = useContext(SlotActionsContext);
  if (!ctx)
    throw new Error("useSlotActions must be used within <SlotActionsProvider>");
  return ctx;
}

export function SlotActionsProvider({
  slots,
  children,
}: {
  slots: DeliverySlot[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DeliverySlot | null>(null);
  const [deleting, setDeleting] = useState<DeliverySlot | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setCreating(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    const slot = deleting;
    startTransition(async () => {
      const result = await deleteSlotAction(slot.id);
      if (result.error) {
        toastError(result.error);
        return;
      }
      toastSuccess("Slot deleted");
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <SlotActionsContext.Provider
      value={{
        openCreate: () => setCreating(true),
        openEdit: setEditing,
        openDelete: setDeleting,
      }}
    >
      {children}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => !open && close()}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit slot" : "New slot"}
            </DialogTitle>
          </DialogHeader>
          {(creating || editing) && (
            <SlotForm slot={editing} allSlots={slots} onClose={close} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete slot</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleting?.label} {deleting?.start_time.slice(0, 5)}–
              {deleting?.end_time.slice(0, 5)}&rdquo;? This action cannot be undone.
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
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SlotActionsContext.Provider>
  );
}
