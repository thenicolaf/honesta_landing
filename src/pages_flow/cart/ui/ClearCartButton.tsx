"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useCart } from "@/providers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
  toastSuccess,
} from "@/shared/ui";

export function ClearCartButton() {
  const { clearCart } = useCart();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    clearCart();
    setOpen(false);
    toastSuccess("Cart cleared");
  }

  return (
    <>
      <Button
        as="button"
        type="button"
        variant="outline"
        color="error"
        size="sm"
        onClick={() => setOpen(true)}
        startIcon={<Trash2 size={12} />}
      >
        Clear cart
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Clear cart</DialogTitle>
            <DialogDescription>
              Remove all items from your cart? This action cannot be undone.
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
              onClick={handleConfirm}
            >
              Clear cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
