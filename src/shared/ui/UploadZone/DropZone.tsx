"use client";

import { useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { IconUpload } from "@/shared/icons";

interface DropZoneProps {
  accept: string;
  multiple: boolean;
  maxSizeMb: number;
  disabled: boolean;
  uploading: boolean;
  state?: "default" | "error";
  onFiles: (files: FileList | File[]) => void;
}

export function DropZone({
  accept,
  multiple,
  maxSizeMb,
  disabled,
  uploading,
  state,
  onFiles,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        disabled={disabled || uploading}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer",
          "font-body text-sm text-earth/50",
          uploading
            ? "border-orange/30 bg-orange/5 pointer-events-none"
            : isDragging
              ? "border-orange bg-orange/5"
              : state === "error"
                ? "border-red-400 hover:border-red-500"
                : "border-parchment hover:border-orange/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {uploading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-earth/15 border-t-earth" />
            <span>Uploading…</span>
          </>
        ) : (
          <>
            <IconUpload className="w-8 h-8 text-earth/30" />
            <span>
              {isDragging ? "Drop images here" : "Click or drag images here"}
            </span>
            <span className="text-2xs text-earth/30">
              {accept === "image/*" ? "PNG, JPG, WEBP" : accept} — max{" "}
              {maxSizeMb}MB
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
    </>
  );
}
