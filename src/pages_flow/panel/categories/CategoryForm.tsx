"use client";

import { useActionState } from "react";
import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormUploadZone,
  FormError,
  Button,
} from "@/shared/ui";
import type { DbCategory } from "@/sections/categories/types";
import { createCategory, updateCategory, type CategoryState } from "./actions";

interface CategoryFormProps {
  category?: DbCategory;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const [state, dispatch, isPending] = useActionState<
    CategoryState | null,
    FormData
  >(action, null);

  return (
    <form key={state?.attempt ?? 0} action={dispatch} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Category info
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormLabel htmlFor="cat-name">Name *</FormLabel>
            <FormInput
              id="cat-name"
              name="name"
              placeholder="e.g. Dried Fruits"
              defaultValue={state?.values?.name ?? category?.name ?? ""}
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

          <div className="sm:col-span-2">
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

          <div className="sm:col-span-2">
            <FormLabel>Image</FormLabel>
            <FormUploadZone
              name="image_url"
              multiple={false}
              initialUrl={category?.image_url ?? undefined}
              slug="category"
              bucket="categories"
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/categories"
          variant="secondary"
          color={"default"}
          size="sm"
        >
          Cancel
        </Button>
        <Button
          as="button"
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "Saving…" : category ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}
