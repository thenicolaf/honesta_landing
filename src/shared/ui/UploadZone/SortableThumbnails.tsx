"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import type { UploadItem } from "./types";
import { SortableThumbnail } from "./SortableThumbnail";

interface SortableThumbnailsProps {
  items: UploadItem[];
  onReorder: (items: UploadItem[]) => void;
  onRemove: (item: UploadItem) => void;
  onPreview?: (index: number) => void;
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
            src={item.url}
            alt={item.name}
            isMain={idx === 0}
            onRemove={() => onRemove(item)}
            onPreview={onPreview ? () => onPreview(idx) : undefined}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
