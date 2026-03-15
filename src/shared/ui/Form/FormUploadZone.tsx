"use client";

import { useState } from "react";
import { UploadZone, type UploadItem, type UploadMultipleProps } from "../UploadZone";
import { Dialog, DialogContent } from "../Dialog";
import { ImagePreview } from "../ImagePreview";

type FormUploadZoneProps = UploadMultipleProps & {
  name: string;
  accept?: string;
  maxSizeMb?: number;
  state?: "default" | "error";
  className?: string;
  /** Existing image URL (edit mode) */
  initialUrl?: string;
  /** Slug for naming files in storage */
  slug?: string;
  /** Storage bucket name (default: "products") */
  bucket?: string;
};

export function FormUploadZone(props: FormUploadZoneProps) {
  const {
    name,
    accept,
    maxSizeMb,
    state,
    className,
    initialUrl,
    slug = "product",
    bucket = "products",
    ...multipleProps
  } = props;

  const [items, setItems] = useState<UploadItem[]>(() =>
    initialUrl
      ? [{ id: crypto.randomUUID(), url: initialUrl, name: "Current image" }]
      : [],
  );
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleUpload = async (file: File): Promise<UploadItem | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);
      formData.append("bucket", bucket);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) return null;

      const { url } = await res.json();
      return { id: crypto.randomUUID(), url, name: file.name };
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (item: UploadItem): Promise<void> => {
    try {
      await fetch("/api/storage/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: item.url, bucket }),
      });
    } catch {
      // Deletion failure shouldn't block UI
    }
  };

  return (
    <>
      <UploadZone
        name={name}
        accept={accept}
        maxSizeMb={maxSizeMb}
        items={items}
        onItemsChange={setItems}
        onUpload={handleUpload}
        onRemove={handleRemove}
        uploading={uploading}
        onPreview={handlePreview}
        state={state}
        className={className}
        {...multipleProps}
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent size="full" className="p-0 overflow-hidden">
          <ImagePreview
            images={items.map((i) => i.url)}
            defaultIndex={previewIndex}
            className="rounded-2xl"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
