"use client";

import { useState } from "react";
import type { DeferredItem } from "./types";

// IMPORTANT: We do NOT revoke blob URLs on component unmount.
//
// Per the W3C File API spec (https://w3c.github.io/FileAPI/):
//   "Attempts to dereference url after it has been revoked will result in a
//    network error."
//
// A <video> playing from a blob URL issues NEW range requests every time the
// user clicks play, seeks the timeline, or switches buffer ranges. If we
// revoke the URL mid-playback (which can happen if the parent component
// unmounts for any reason — strict mode, conditional render, route change),
// all subsequent fetches fail and the video silently resets to 0:00.
//
// We only revoke URLs on EXPLICIT user removal (the X button on a thumbnail).
// Other blobs are left for the browser's GC to collect when the page unloads
// or the blob is no longer referenced by any DOM element.
export function useDeferredItems(
  maxFiles: number,
  maxSizeMb: number,
  items?: DeferredItem[],
  onItemsChange?: (items: DeferredItem[]) => void,
  mimePrefix: string = "image/",
) {
  const [internalItems, setInternalItems] = useState<DeferredItem[]>([]);
  const isControlled = items !== undefined;
  const currentItems = isControlled ? items : internalItems;

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
      // Accept by MIME OR by file extension — some OS / browser combos
      // report empty file.type for valid videos (notably MOV on Windows).
      const matchesMime = file.type.startsWith(mimePrefix);
      const matchesExt = matchesExtensionFor(mimePrefix, file.name);
      if (!matchesMime && !matchesExt) continue;
      if (file.size > maxBytes) continue;

      newItems.push({
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
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
    }
    updateItems(currentItems.filter((i) => i.id !== id));
  };

  return { items: currentItems, addFiles, removeItem, reorder: updateItems };
}

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv", "mkv"];

function matchesExtensionFor(mimePrefix: string, filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return false;
  if (mimePrefix === "image/") return IMAGE_EXTENSIONS.includes(ext);
  if (mimePrefix === "video/") return VIDEO_EXTENSIONS.includes(ext);
  return false;
}
