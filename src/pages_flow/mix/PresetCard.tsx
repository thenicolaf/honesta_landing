"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { MixPreset } from "@/lib/mixBoxesDb";

interface PresetCardProps {
  preset: MixPreset;
  count: number;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export function PresetCard({
  preset,
  count,
  canAdd,
  onAdd,
  onRemove,
}: PresetCardProps) {
  const isSelected = count > 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl overflow-hidden bg-white-warm border-2 transition-all duration-200",
        isSelected
          ? "border-orange shadow-lg"
          : "border-transparent hover:shadow-md",
      )}
    >
      {isSelected && (
        <Badge
          variant="counter"
          size="pill"
          className="absolute top-2 right-2 z-10 min-w-6 h-6 text-sm"
        >
          {count}
        </Badge>
      )}

      <div className="relative aspect-3/2 bg-sand">
        {preset.product?.image_url ? (
          <Image
            src={preset.product.image_url}
            alt={preset.product?.title ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-earth/20">
            <span className="font-body text-2xs uppercase">No image</span>
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-1 grow">
        <p className="font-body font-medium text-sm text-heading leading-tight line-clamp-2">
          {preset.product?.title ?? "—"}
        </p>
        <p className="font-body font-light text-xs text-earth/55">
          {preset.weight_g}g · AED {Number(preset.price).toFixed(2)}
        </p>

        <div className="flex items-center gap-1.5 mt-auto pt-1.5 justify-end">
          {isSelected && (
            <Button
              as="button"
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              aria-label="Remove one"
              className="w-7 h-7"
            >
              <Minus size={14} />
            </Button>
          )}
          <Button
            as="button"
            type="button"
            variant={isSelected ? "outline" : "primary"}
            size="icon"
            onClick={onAdd}
            disabled={!canAdd}
            aria-label="Add one"
            className="w-7 h-7"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
