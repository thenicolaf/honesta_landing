"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  useDialog,
  FormLabel,
  FormInput,
  FormTextarea,
  FormError,
  Button,
} from "@/shared/ui";
import type { DbCategory } from "@/sections/categories/types";
import { createCategory, updateCategory, type CategoryState } from "./actions";

function CategoryForm({ category }: { category?: DbCategory }) {
  const { close } = useDialog();
  const router = useRouter();

  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const [state, dispatch, isPending] = useActionState<
    CategoryState | null,
    FormData
  >(action, null);

  useEffect(() => {
    if (state?.success) {
      close();
      router.refresh();
    }
  }, [state?.success, close, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="cat-name">Name</FormLabel>
        <FormInput
          id="cat-name"
          name="name"
          placeholder="e.g. Dried Fruits"
          defaultValue={
            state?.values?.name ?? category?.name ?? ""
          }
          state={state?.fieldErrors?.name ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.name} />
      </div>

      <div>
        <FormLabel htmlFor="cat-audience">Audience</FormLabel>
        <FormInput
          id="cat-audience"
          name="audience"
          placeholder="e.g. Health enthusiasts"
          defaultValue={
            state?.values?.audience ?? category?.audience ?? ""
          }
        />
      </div>

      <div>
        <FormLabel htmlFor="cat-tagline">Tagline</FormLabel>
        <FormInput
          id="cat-tagline"
          name="tagline"
          placeholder="e.g. Pure. Natural. Delicious."
          defaultValue={
            state?.values?.tagline ?? category?.tagline ?? ""
          }
        />
      </div>

      <div>
        <FormLabel htmlFor="cat-description">Description</FormLabel>
        <FormTextarea
          id="cat-description"
          name="description"
          rows={3}
          placeholder="Short description of the category…"
          defaultValue={
            state?.values?.description ?? category?.description ?? ""
          }
        />
      </div>

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <Button
          as="button"
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "Saving…" : category ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryFormDialog({
  category,
  open,
  onOpenChange,
}: {
  category?: DbCategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isEdit = !!category;

  const isControlled = open !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button
              as="button"
              type="button"
              variant="text"
              size="icon"
              aria-label={`Edit ${category!.name}`}
            >
              <Pencil size={15} aria-hidden="true" />
            </Button>
          ) : (
            <Button as="button" type="button" variant="primary" size="sm">
              <Plus size={14} aria-hidden="true" />
              New Category
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <CategoryForm key={category?.id ?? "create"} category={category} />
      </DialogContent>
    </Dialog>
  );
}
