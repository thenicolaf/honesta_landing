"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { CATEGORY_UI_MAP } from "@/sections/categories/consts";
import type { DbCategory } from "@/sections/categories/types";
import { useCategoryActions } from "./CategoryActionsProvider";

export function AdminCategoryCard({ category }: { category: DbCategory }) {
  const { openDelete } = useCategoryActions();

  const { Icon, placeholderBg } = CATEGORY_UI_MAP[category.slug] ?? {
    Icon: IconLeaf,
    placeholderBg: "bg-earth/10",
  };

  return (
    <div className="flex flex-col rounded-[16px] bg-white-warm border border-earth/8 overflow-hidden">
      {/* Image / placeholder */}
      <div
        className={`relative aspect-4/3 ${category.image_url ? "" : placeholderBg} flex items-center justify-center`}
      >
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <Icon className="w-16 h-16 text-earth/20" />
        )}
      </div>

      <div className="flex flex-col p-6 gap-4 grow">
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

        <div className="flex items-center gap-2 [&>a]:grow [&>button]:grow mt-auto">
          <Button
            as="a"
            href={`/panel/categories/${category.id}/edit`}
            variant="outline"
            size="sm"
            startIcon={<Pencil size={12} aria-hidden="true" />}
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
    </div>
  );
}
