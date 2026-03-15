"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  useDialog,
  Button,
} from "@/shared/ui";
import { deleteProduct } from "./actions";

function DeleteConfirm({ id }: { id: string }) {
  const { close } = useDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteProduct(id);
      close();
      router.refresh();
    });
  }

  return (
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
  );
}

interface DeleteProductDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteProductDialog({
  id,
  name,
  open,
  onOpenChange,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DeleteConfirm id={id} />
      </DialogContent>
    </Dialog>
  );
}
