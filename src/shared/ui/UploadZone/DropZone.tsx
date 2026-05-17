"use client";

import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { cn } from "@/shared/utils/cn";
import { IconUpload } from "@/shared/icons";
import { toastError } from "../Toast";

interface DropZoneProps {
  accept: string;
  multiple: boolean;
  maxSizeMb: number;
  disabled: boolean;
  state?: "default" | "error";
  onFiles: (files: File[]) => void;
  noun?: string;
  acceptLabel?: string;
}

// Build a react-dropzone accept config that uses both MIME wildcards AND
// explicit extensions. Required for video — some OSes (notably Windows for
// certain MOV files) report empty file.type, which causes a pure MIME match
// to silently reject the file.
function buildAccept(accept: string): Accept {
  if (accept === "image/*") {
    return { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"] };
  }
  if (accept === "video/*") {
    return { "video/*": [".mp4", ".webm", ".mov", ".m4v", ".ogv", ".mkv"] };
  }
  return { [accept]: [] };
}

function describeRejection(rejection: FileRejection): string {
  const reasons = rejection.errors.map((e) => {
    if (e.code === "file-too-large") return `too large`;
    if (e.code === "file-invalid-type") return `unsupported file type`;
    if (e.code === "too-many-files") return `too many files`;
    return e.message;
  });
  return `"${rejection.file.name}" — ${reasons.join(", ")}`;
}

export function DropZone({
  accept,
  multiple,
  maxSizeMb,
  disabled,
  state,
  onFiles,
  noun = "images",
  acceptLabel,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: buildAccept(accept),
    multiple,
    maxSize: maxSizeMb * 1024 * 1024,
    disabled,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const message = fileRejections
          .map(describeRejection)
          .join("\n");
        toastError(`${message}\nMax size: ${maxSizeMb}MB.`);
      }
      if (acceptedFiles.length > 0) {
        onFiles(acceptedFiles);
      }
    },
  });

  const formatLabel =
    acceptLabel ?? (accept === "image/*" ? "PNG, JPG, WEBP" : accept);

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
        {isDragActive ? `Drop ${noun} here` : `Click or drag ${noun} here`}
      </span>
      <span className="text-2xs text-earth/30">
        {formatLabel} — max {maxSizeMb}MB
      </span>
    </button>
  );
}
