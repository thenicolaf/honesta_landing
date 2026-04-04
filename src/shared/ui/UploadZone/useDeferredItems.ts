"use client";

import { useState, useEffect, useRef } from "react";
import type { DeferredItem } from "./types";

export function useDeferredItems(
  maxFiles: number,
  maxSizeMb: number,
  items?: DeferredItem[],
  onItemsChange?: (items: DeferredItem[]) => void,
) {
  const [internalItems, setInternalItems] = useState<DeferredItem[]>([]);
  const isControlled = items !== undefined;
  const currentItems = isControlled ? items : internalItems;

  // Track blob URLs for cleanup on unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const updateItems = (next: DeferredItem[]) => {
    if (!isControlled) setInternalItems(next);
    onItemsChange?.(next);
  };

  const addFiles = (incoming: File[]) => {
    const maxBytes = maxSizeMb * 1024 * 1024;
    const remaining = maxFiles - currentItems.length;
    if (remaining <= 0) return;

    const newItems: DeferredItem[] = [];
    const list = incoming.slice(0, remaining);

    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > maxBytes) continue;

      const preview = URL.createObjectURL(file);
      blobUrlsRef.current.add(preview);

      newItems.push({
        id: crypto.randomUUID(),
        preview,
        name: file.name,
        origin: false,
        file,
      });
    }

    if (newItems.length > 0) {
      updateItems([...currentItems, ...newItems]);
    }
  };

  const removeItem = (id: string) => {
    const target = currentItems.find((i) => i.id === id);
    if (target && !target.origin) {
      URL.revokeObjectURL(target.preview);
      blobUrlsRef.current.delete(target.preview);
    }
    updateItems(currentItems.filter((i) => i.id !== id));
  };

  // Revoke all blob URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  return { items: currentItems, addFiles, removeItem, reorder: updateItems };
}
