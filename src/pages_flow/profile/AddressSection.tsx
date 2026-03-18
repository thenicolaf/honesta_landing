"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AddressCard,
  Button,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  toastSuccess,
  toastError,
} from "@/shared/ui";
import { Plus } from "lucide-react";
import { AddressDialog } from "./AddressDialog";
import { deleteAddressAction, setDefaultAddressAction } from "./addressActions";
import type { UserAddress } from "@/lib/addressesDb";

interface AddressSectionProps {
  addresses: UserAddress[];
}

export function AddressSection({ addresses }: AddressSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddressAction(id);
      if (result.error) {
        toastError(result.error);
      } else {
        toastSuccess("Default address updated");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    startTransition(async () => {
      const result = await deleteAddressAction(id);
      if (result.error) {
        toastError(result.error);
      } else {
        toastSuccess("Address deleted");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50">
          Delivery Addresses
        </p>
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          label="No saved addresses"
          description="Add your first delivery address to speed up checkout."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.is_default}
              disabled={isPending}
              onSelect={() => handleSetDefault(addr.id)}
              onEdit={() => setEditAddress(addr)}
              onDelete={() => setDeleteId(addr.id)}
            />
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogOpen || editAddress !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditAddress(null);
          }
        }}
        editAddress={editAddress}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              as="button"
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
