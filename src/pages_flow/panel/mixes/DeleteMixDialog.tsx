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
  toastSuccess,
} from "@/shared/ui";
import { deleteMixAction } from "./actions";

function DeleteConfirm({ id }: { id: string }) {
  const { close } = useDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteMixAction(id);
      close();
      toastSuccess("Mix deleted");
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

interface DeleteMixDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteMixDialog({
  id,
  name,
  open,
  onOpenChange,
}: DeleteMixDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete Mix</DialogTitle>
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
