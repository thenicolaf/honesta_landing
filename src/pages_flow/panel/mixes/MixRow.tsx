"use client";

import Image from "next/image";
import { GripVertical, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { MixBox } from "@/lib/mixBoxesDb";
import { useMixActions } from "./MixActionsProvider";

export function MixRow({
  mix,
  dragHandleRef,
}: {
  mix: MixBox;
  dragHandleRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const { openDelete } = useMixActions();

  return (
    <div className="group relative flex flex-col h-full rounded-2xl bg-white-warm border border-earth/8 p-3 sm:p-4">
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

      <div className="flex gap-3 sm:gap-4 md:gap-5 grow">
        <div className="relative shrink-0 w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56 aspect-4/3 rounded-xl overflow-hidden bg-sand">
          {mix.image_url ? (
            <Image
              src={mix.image_url}
              alt={mix.name}
              fill
              className="object-cover pointer-events-none"
              draggable={false}
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, (max-width: 1024px) 240px, (max-width: 1280px) 256px, (max-width: 1536px) 208px, 224px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-earth/30">
              <LayoutGrid size={40} aria-hidden="true" />
            </div>
          )}

          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-wrap gap-1">
            <Badge variant="counter" size="xs" className="sm:px-3! sm:py-1! sm:text-2xs!">
              {mix.cell_count} CELLS
            </Badge>
          </div>

          {!mix.is_active && (
            <Badge
              variant="outline"
              size="xs"
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-white-warm/80 backdrop-blur-sm sm:px-3! sm:py-1! sm:text-2xs!"
            >
              Inactive
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/45">
            Mix box
          </p>
          <h3 className="font-display font-semibold text-lg text-heading leading-tight">
            {mix.name}
          </h3>

          {mix.description && (
            <p className="font-body font-light text-sm text-earth/70">
              {mix.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="natural" size="xs">
              {mix.presets.length} {mix.presets.length === 1 ? "preset" : "presets"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-earth/8">
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
  );
}
