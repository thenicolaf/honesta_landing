"use client";

import Image from "next/image";
import { GripVertical, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { Badge, Button, MixCompositionList } from "@/shared/ui";
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
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 hover:shadow-lg hover:border-transparent transition-colors duration-200">
      <div className="relative aspect-3/2 rounded-t-2xl overflow-hidden bg-sand">
        {mix.image_url ? (
          <Image
            src={mix.image_url}
            alt={mix.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-earth/30">
            <LayoutGrid size={40} aria-hidden="true" />
          </div>
        )}

        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
          <Badge variant="counter" size="xs">
            {mix.cell_count} CELLS
          </Badge>
          {!mix.is_active && (
            <Badge variant="outline" size="xs" className="bg-white-warm/80">
              Inactive
            </Badge>
          )}
        </div>

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
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
          Mix box
        </p>

        <h3 className="font-display font-semibold text-heading leading-tight capitalize text-[clamp(1rem,4vw,1.15rem)] min-[520px]:text-[clamp(1.15rem,2vw,1.4rem)]">
          {mix.name}
        </h3>

        {mix.description && (
          <p className="font-body font-light text-2xs text-earth/70 line-clamp-2">
            {mix.description}
          </p>
        )}

        <MixCompositionList
          items={mix.presets.map((p) => ({
            name: p.product?.title ?? "Unknown",
            image_url: p.product?.image_url ?? null,
            count: 1,
            weight_g: p.weight_g,
            price: p.price,
          }))}
          triggerLabel={`Presets · ${mix.presets.length}`}
          showCountBadge={false}
        />

        <div className="flex flex-col items-stretch gap-2 pt-1 mt-auto min-[520px]:flex-row min-[520px]:items-center">
          <Button
            as="a"
            href={`/panel/mixes/${mix.id}/edit`}
            variant="outline"
            size="sm"
            startIcon={<Pencil size={12} aria-hidden="true" />}
            aria-label={`Edit ${mix.name}`}
            className="w-full min-[520px]:flex-1"
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
            className="w-full min-[520px]:flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
