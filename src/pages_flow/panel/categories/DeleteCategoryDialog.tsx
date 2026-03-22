"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
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
import { deleteCategory } from "./actions";

function DeleteConfirm({ id }: { id: string; name: string }) {
  const { close } = useDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteCategory(id);
      close();
      toastSuccess("Category deleted");
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
        size="sm"
        className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Deleting…" : "Delete"}
      </Button>
    </DialogFooter>
  );
}

export function DeleteCategoryDialog({
  id,
  name,
  open,
  onOpenChange,
}: {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isControlled = open !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            aria-label={`Delete ${name}`}
            className="text-earth/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 size={15} aria-hidden="true" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DeleteConfirm id={id} name={name} />
      </DialogContent>
    </Dialog>
  );
}
