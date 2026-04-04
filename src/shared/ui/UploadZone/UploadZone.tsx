"use client";

import { cn } from "@/shared/utils/cn";
import type { DeferredItem, UploadMultipleProps } from "./types";
import { DropZone } from "./DropZone";
import { SortableThumbnails } from "./SortableThumbnails";
import { useDeferredItems } from "./useDeferredItems";

interface UploadZoneBase {
  name: string;
  accept?: string;
  maxSizeMb?: number;
  state?: "default" | "error";
  className?: string;
  items: DeferredItem[];
  onItemsChange: (items: DeferredItem[]) => void;
  onPreview?: (index: number) => void;
}

type UploadZoneProps = UploadZoneBase & UploadMultipleProps;

export function UploadZone(props: UploadZoneProps) {
  const {
    name,
    accept = "image/*",
    maxSizeMb = 5,
    state,
    className,
    items,
    onItemsChange,
    onPreview,
  } = props;

  const multiple = props.multiple ?? true;
  const maxFiles = multiple ? (props.maxFiles ?? 10) : 1;

  const { addFiles, removeItem, reorder } = useDeferredItems(
    maxFiles,
    maxSizeMb,
    items,
    onItemsChange,
  );

  const atLimit = items.length >= maxFiles;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DropZone
        accept={accept}
        multiple={multiple}
        maxSizeMb={maxSizeMb}
        disabled={atLimit}
        state={state}
        onFiles={addFiles}
      />

      {/* Hybrid hidden inputs: text for existing URLs, file for new uploads */}
      {items.map((item) =>
        item.origin ? (
          <input key={item.id} type="hidden" name={name} value={item.preview} />
        ) : item.file ? (
          <input
            key={item.id}
            type="file"
            name={name}
            className="hidden"
            ref={(el) => {
              if (el) {
                const dt = new DataTransfer();
                dt.items.add(item.file!);
                el.files = dt.files;
              }
            }}
          />
        ) : null,
      )}

      <SortableThumbnails
        items={items}
        onReorder={reorder}
        onRemove={(item) => removeItem(item.id)}
        onPreview={onPreview}
      />
    </div>
  );
}
