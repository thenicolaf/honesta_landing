"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { DbCategory } from "@/sections/categories/types";
import { useCategoryActions } from "./CategoryActionsProvider";

export function AdminCategoryCard({ category }: { category: DbCategory }) {
  const { openEdit, openDelete } = useCategoryActions();

  return (
    <div className="flex flex-col rounded-[16px] bg-white-warm border border-earth/8 p-6 gap-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/50">
          {category.audience}
        </p>
        <Badge variant="natural" className="shrink-0">
          Natural
        </Badge>
      </div>

      <div>
        <h3
          className="font-display font-semibold text-heading leading-tight mb-1"
          style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
        >
          {category.name}
        </h3>
        <p className="font-body font-light text-sm text-earth/60 italic">
          {category.tagline}
        </p>
      </div>

      <p className="font-body font-light text-sm text-earth/60 leading-relaxed grow">
        {category.description}
      </p>

      <div className="flex items-center gap-2 pt-2 border-t [&>button]:grow border-earth/8">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          startIcon={<Pencil size={12} aria-hidden="true" />}
          onClick={() => openEdit(category)}
          aria-label={`Edit ${category.name}`}
        >
          Edit
        </Button>
        <Button
          as="button"
          type="button"
          variant="outline"
          color="error"
          size="sm"
          startIcon={<Trash2 size={12} aria-hidden="true" />}
          onClick={() => openDelete(category)}
          aria-label={`Delete ${category.name}`}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
