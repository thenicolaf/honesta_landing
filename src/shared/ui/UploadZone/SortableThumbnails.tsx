"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import type { DeferredItem } from "./types";
import { SortableThumbnail } from "./SortableThumbnail";

interface SortableThumbnailsProps {
  items: DeferredItem[];
  onReorder: (items: DeferredItem[]) => void;
  onRemove: (item: DeferredItem) => void;
  onPreview?: (index: number) => void;
  kind?: "image" | "video";
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function SortableThumbnails({
  items,
  onReorder,
  onRemove,
  onPreview,
  kind,
}: SortableThumbnailsProps) {
  if (items.length === 0) return null;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { source } = event.operation;

        if (source && isSortable(source)) {
          const from = source.initialIndex;
          const to = source.index;
          if (from !== to) {
            onReorder(moveItem(items, from, to));
          }
        }
      }}
    >
      <ul className="flex flex-wrap gap-3">
        {items.map((item, idx) => (
          <SortableThumbnail
            key={item.id}
            id={item.id}
            index={idx}
            src={item.preview}
            alt={item.name}
            isMain={idx === 0}
            sortable={items.length > 1}
            onRemove={() => onRemove(item)}
            onPreview={onPreview ? () => onPreview(idx) : undefined}
            kind={kind}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
