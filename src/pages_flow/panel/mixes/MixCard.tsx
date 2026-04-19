"use client";

import Image from "next/image";
import { GripVertical, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { MixBox } from "@/lib/mixBoxesDb";
import { useMixActions } from "./MixActionsProvider";

export function MixCard({
  mix,
  dragHandleRef,
}: {
  mix: MixBox;
  dragHandleRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const { openDelete } = useMixActions();

  return (
    <div className="relative h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 overflow-hidden">
      {dragHandleRef && (
        <Button
          as="button"
          type="button"
          ref={dragHandleRef}
          variant="primary"
          size="icon"
          className="absolute top-2 right-2 z-20 w-7! h-7! rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-150 touch-none"
        >
          <GripVertical size={14} className="pointer-events-none" />
        </Button>
      )}

      <div className="relative aspect-4/3 bg-sand">
        {mix.image_url ? (
          <Image
            src={mix.image_url}
            alt={mix.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-earth/30">
            <LayoutGrid size={48} aria-hidden="true" />
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
          <Badge
            variant="counter"
            size="xs"
            className="sm:px-3! sm:py-1! sm:text-2xs!"
          >
            {mix.cell_count} CELLS
          </Badge>
          {!mix.is_active && (
            <Badge
              variant="outline"
              size="xs"
              className="bg-white-warm/80 backdrop-blur-sm sm:px-3! sm:py-1! sm:text-2xs!"
            >
              Inactive
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/45 mb-1">
          Mix box
        </p>
        <h3 className="font-display font-semibold text-lg text-heading leading-tight">
          {mix.name}
        </h3>

        {mix.description && (
          <p className="font-body font-light text-sm text-earth/70 line-clamp-2 mt-1">
            {mix.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 my-2">
          <Badge variant="natural" size="xs">
            {mix.presets.length}{" "}
            {mix.presets.length === 1 ? "preset" : "presets"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 [&>a]:grow [&>button]:grow mt-auto pt-3 border-t border-earth/8">
          <Button
            as="a"
            href={`/panel/mixes/${mix.id}/edit`}
            variant="outline"
            size="sm"
            startIcon={<Pencil size={12} aria-hidden="true" />}
            aria-label={`Edit ${mix.name}`}
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
            onClick={() => openDelete(mix)}
            aria-label={`Delete ${mix.name}`}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
