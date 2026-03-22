"use client";

import { cn } from "@/shared/utils/cn";
import type { UploadFile, UploadItem, UploadMultipleProps } from "./types";
import { DropZone } from "./DropZone";
import { SortableThumbnails } from "./SortableThumbnails";
import { DataTransferInputs } from "./DataTransferInputs";
import { useFilesMode } from "./useFilesMode";
import { useItemsMode } from "./useItemsMode";

interface UploadZoneBase {
  name: string;
  accept?: string;
  maxSizeMb?: number;
  state?: "default" | "error";
  className?: string;

  // --- Legacy file-based mode (used when onUpload is NOT provided) ---
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;

  // --- URL-based mode (used when onUpload IS provided) ---
  items?: UploadItem[];
  onItemsChange?: (items: UploadItem[]) => void;
  onUpload?: (file: File) => Promise<UploadItem | null>;
  onRemove?: (item: UploadItem) => Promise<void>;
  uploading?: boolean;

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
    value,
    onChange,
    items,
    onItemsChange,
    onUpload,
    onRemove,
    uploading = false,
    onPreview,
  } = props;

  const multiple = props.multiple ?? true;
  const maxFiles = multiple ? (props.maxFiles ?? 10) : 1;
  const isUrlMode = !!onUpload;

  const filesMode = useFilesMode(maxFiles, maxSizeMb, value, onChange);
  const itemsMode = useItemsMode(
    maxFiles,
    maxSizeMb,
    onUpload ?? (async () => null),
    onRemove,
    items,
    onItemsChange,
  );

  const itemCount = isUrlMode ? itemsMode.items.length : filesMode.files.length;
  const atLimit = itemCount >= maxFiles;

  const handleFiles = (incoming: FileList | File[]) => {
    if (isUrlMode) {
      itemsMode.addFiles(incoming);
    } else {
      filesMode.addFiles(incoming);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DropZone
        accept={accept}
        multiple={multiple}
        maxSizeMb={maxSizeMb}
        disabled={atLimit}
        uploading={uploading}
        state={state}
        onFiles={handleFiles}
      />

      {/* Hidden inputs for form submission */}
      {isUrlMode
        ? itemsMode.items.map((item) => (
            <input
              key={item.id}
              type="hidden"
              name={name}
              value={item.url}
            />
          ))
        : <DataTransferInputs name={name} files={filesMode.files} />
      }

      {/* Thumbnails — URL mode */}
      {isUrlMode && (
        <SortableThumbnails
          items={itemsMode.items}
          onReorder={(reordered) => itemsMode.reorder(reordered)}
          onRemove={(item) => itemsMode.removeItem(item)}
          onPreview={onPreview}
        />
      )}

      {/* Thumbnails — Legacy file mode */}
      {!isUrlMode && (
        <SortableThumbnails
          items={filesMode.files.map((f) => ({ id: f.id, url: f.preview, name: f.file.name }))}
          onReorder={(reordered) => {
            const reorderedFiles = reordered
              .map((item) => filesMode.files.find((f) => f.id === item.id))
              .filter(Boolean) as typeof filesMode.files;
            filesMode.reorder(reorderedFiles);
          }}
          onRemove={(item) => filesMode.removeFile(item.id)}
          onPreview={onPreview}
        />
      )}
    </div>
  );
}
