"use client";

import { useState, useCallback } from "react";
import type { UploadFile } from "./types";

export function useFilesMode(
  maxFiles: number,
  maxSizeMb: number,
  value?: UploadFile[],
  onChange?: (files: UploadFile[]) => void,
) {
  const [internalFiles, setInternalFiles] = useState<UploadFile[]>([]);
  const isControlled = value !== undefined;
  const files = isControlled ? value : internalFiles;

  const updateFiles = useCallback(
    (next: UploadFile[]) => {
      if (!isControlled) setInternalFiles(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const maxBytes = maxSizeMb * 1024 * 1024;
      const remaining = maxFiles - files.length;
      if (remaining <= 0) return;

      const newFiles: UploadFile[] = [];
      const list = Array.from(incoming).slice(0, remaining);

      for (const file of list) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxBytes) continue;
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (newFiles.length > 0) {
        updateFiles([...files, ...newFiles]);
      }
    },
    [files, maxFiles, maxSizeMb, updateFiles],
  );

  const removeFile = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      updateFiles(files.filter((f) => f.id !== id));
    },
    [files, updateFiles],
  );

  return { files, addFiles, removeFile, reorder: updateFiles };
}
