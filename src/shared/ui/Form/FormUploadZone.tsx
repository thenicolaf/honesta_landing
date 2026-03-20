"use client";

import { useState } from "react";
import { UploadZone, type UploadItem, type UploadMultipleProps } from "../UploadZone";
import { Lightbox } from "../Lightbox";

type FormUploadZoneProps = UploadMultipleProps & {
  name: string;
  accept?: string;
  maxSizeMb?: number;
  state?: "default" | "error";
  className?: string;
  /** Existing image URL (edit mode, single) */
  initialUrl?: string;
  /** Existing image URLs (edit mode, multiple) */
  initialUrls?: string[];
  /** Slug for naming files in storage */
  slug?: string;
  /** Storage bucket name (default: "products") */
  bucket?: string;
};

function buildInitialItems(
  initialUrls?: string[],
  initialUrl?: string,
): UploadItem[] {
  if (initialUrls?.length) {
    return initialUrls.map((url, i) => ({
      id: crypto.randomUUID(),
      url,
      name: `Image ${i + 1}`,
    }));
  }
  if (initialUrl) {
    return [{ id: crypto.randomUUID(), url: initialUrl, name: "Current image" }];
  }
  return [];
}

export function FormUploadZone(props: FormUploadZoneProps) {
  const {
    name,
    accept,
    maxSizeMb,
    state,
    className,
    initialUrl,
    initialUrls,
    slug = "product",
    bucket = "products",
    ...multipleProps
  } = props;

  const [items, setItems] = useState<UploadItem[]>(() =>
    buildInitialItems(initialUrls, initialUrl),
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

      <Lightbox
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        slides={items.map((i) => ({ src: i.url, alt: i.name }))}
        index={previewIndex}
      />
    </>
  );
}
