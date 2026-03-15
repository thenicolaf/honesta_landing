"use client";

import { useState, useCallback } from "react";
import type { UploadItem } from "./types";

export function useItemsMode(
  maxFiles: number,
  maxSizeMb: number,
  onUpload: (file: File) => Promise<UploadItem | null>,
  onRemove?: (item: UploadItem) => Promise<void>,
  items?: UploadItem[],
  onItemsChange?: (items: UploadItem[]) => void,
) {
  const [internalItems, setInternalItems] = useState<UploadItem[]>([]);
  const isControlled = items !== undefined;
  const currentItems = isControlled ? items : internalItems;

  const updateItems = useCallback(
    (next: UploadItem[]) => {
      if (!isControlled) setInternalItems(next);
      onItemsChange?.(next);
    },
    [isControlled, onItemsChange],
  );

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const maxBytes = maxSizeMb * 1024 * 1024;
      const remaining = maxFiles - currentItems.length;
      if (remaining <= 0) return;

      const list = Array.from(incoming).slice(0, remaining);

      for (const file of list) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxBytes) continue;

        const result = await onUpload(file);
        if (result) {
          updateItems([...currentItems, result]);
        }
      }
    },
    [currentItems, maxFiles, maxSizeMb, onUpload, updateItems],
  );

  const removeItem = useCallback(
    async (item: UploadItem) => {
      updateItems(currentItems.filter((i) => i.id !== item.id));
      await onRemove?.(item);
    },
    [currentItems, updateItems, onRemove],
  );

  return { items: currentItems, addFiles, removeItem };
}
