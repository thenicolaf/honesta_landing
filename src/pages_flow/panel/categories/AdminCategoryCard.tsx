"use client";

import Image from "next/image";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { CATEGORY_UI_MAP } from "@/sections/categories/consts";
import type { DbCategory } from "@/sections/categories/types";
import { useCategoryActions } from "./CategoryActionsProvider";

export function AdminCategoryCard({
  category,
  dragHandleRef,
}: {
  category: DbCategory;
  dragHandleRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const { openDelete } = useCategoryActions();

  const { Icon, placeholderBg } = CATEGORY_UI_MAP[category.slug] ?? {
    Icon: IconLeaf,
    placeholderBg: "bg-earth/10",
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 hover:shadow-lg hover:border-transparent transition-colors duration-200">
      <div className="relative aspect-3/2 rounded-t-2xl overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${placeholderBg}`}
          >
            <Icon className="w-12 h-12 text-earth/20" />
          </div>
        )}

        {dragHandleRef && (
          <Button
            as="button"
            type="button"
            ref={dragHandleRef}
            variant="primary"
            size="icon"
            className="absolute top-2 right-2 z-10 w-7! h-7! rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-150 touch-none"
          >
            <GripVertical size={14} className="pointer-events-none" />
          </Button>
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
            {category.audience}
          </p>
          {category.badge && (
            <Badge variant="natural" size="xs">
              {category.badge}
            </Badge>
          )}
        </div>

        <h3 className="font-display font-semibold text-heading leading-tight capitalize text-[clamp(1rem,4vw,1.15rem)] min-[520px]:text-[clamp(1.15rem,2vw,1.4rem)]">
          {category.name}
        </h3>

        {category.tagline && (
          <p className="font-body font-light text-2xs text-earth/70 line-clamp-2">
            {category.tagline}
          </p>
        )}

        <div className="flex flex-row items-center gap-2 pt-1 mt-auto">
          <Button
            as="a"
            href={`/panel/categories/${category.id}/edit`}
            variant="outline"
            size="sm"
            startIcon={<Pencil size={12} aria-hidden="true" />}
            aria-label={`Edit ${category.name}`}
            className="flex-1"
          >
            <span className="hidden sm:inline">Edit</span>
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
            className="flex-1"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
