"use client";

import Image from "next/image";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { CATEGORY_UI_MAP } from "@/sections/categories/consts";
import type { DbCategory } from "@/sections/categories/types";
import { useCategoryActions } from "./CategoryActionsProvider";

export function AdminCategoryRow({
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
    <div className="group relative flex flex-col h-full rounded-[16px] bg-white-warm border border-earth/8 p-3 sm:p-4">
      {/* Drag handle — top-right of the whole row */}
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

      {/* Content area — grows so footer sticks to bottom. Uses flow-root to contain the float. */}
      <div className="grow flow-root">
        {/* Floated image — content wraps around it */}
        <div
          className={`relative float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-32 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-56 aspect-4/3 rounded-xl overflow-hidden ${category.image_url ? "" : placeholderBg} flex items-center justify-center`}
        >
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover pointer-events-none"
              draggable={false}
              sizes="(max-width: 640px) 128px, (max-width: 768px) 176px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, (max-width: 1536px) 288px, 224px"
            />
          ) : (
            <Icon className="w-12 h-12 text-earth/20" />
          )}
        </div>

        {/* Audience + name cluster */}
        <div className="flex flex-col items-start pr-10 gap-1.5 sm:gap-2">
          <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/50">
            {category.audience}
          </p>
          <h3
            className="font-display font-semibold text-heading leading-tight"
            style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
          >
            {category.name}
          </h3>
        </div>

        {/* Badge — natural width, wraps inside if parent constrains it */}
        {category.badge && (
          <div className="mt-2 md:mt-2.5 -translate-x-2">
            <Badge variant="natural">{category.badge}</Badge>
          </div>
        )}

        <p className="font-body font-light text-sm text-earth/60 italic mt-2.5 sm:mt-3 md:mt-4 mb-2 sm:mb-3 md:mb-4">
          {category.tagline}
        </p>

        <p className="font-body font-light text-sm text-earth/60 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Footer — pinned to bottom */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-earth/8">
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
  );
}
