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
    <div className="relative flex flex-col h-full rounded-[16px] bg-white-warm border border-earth/8 overflow-hidden">
      {/* Drag handle */}
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
      {/* Image / placeholder */}
      <div
        className={`relative aspect-4/3 ${category.image_url ? "" : placeholderBg} flex items-center justify-center`}
      >
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
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
          {category.badge && (
            <Badge variant="natural" className="shrink-0">
              {category.badge}
            </Badge>
          )}
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
