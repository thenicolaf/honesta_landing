"use client";

import { useDropzone } from "react-dropzone";
import { cn } from "@/shared/utils/cn";
import { IconUpload } from "@/shared/icons";

interface DropZoneProps {
  accept: string;
  multiple: boolean;
  maxSizeMb: number;
  disabled: boolean;
  state?: "default" | "error";
  onFiles: (files: File[]) => void;
}

export function DropZone({
  accept,
  multiple,
  maxSizeMb,
  disabled,
  state,
  onFiles,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: accept === "image/*" ? { "image/*": [] } : { [accept]: [] },
    multiple,
    maxSize: maxSizeMb * 1024 * 1024,
    disabled,
    onDrop: onFiles,
  });

  return (
    <button
      type="button"
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer",
        "font-body text-sm text-earth/50",
        isDragActive
          ? "border-orange bg-orange/5"
          : state === "error"
            ? "border-red-400 hover:border-red-500"
            : "border-parchment hover:border-orange/50",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input {...getInputProps()} />

      <IconUpload className="w-8 h-8 text-earth/30" />
      <span>
        {isDragActive ? "Drop images here" : "Click or drag images here"}
      </span>
      <span className="text-2xs text-earth/30">
        {accept === "image/*" ? "PNG, JPG, WEBP" : accept} — max {maxSizeMb}MB
      </span>
    </button>
  );
}
