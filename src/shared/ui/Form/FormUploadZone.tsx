"use client";

import { useState } from "react";
import { UploadZone, type DeferredItem, type UploadMultipleProps } from "../UploadZone";
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
): DeferredItem[] {
  if (initialUrls?.length) {
    return initialUrls.map((url, i) => ({
      id: crypto.randomUUID(),
      preview: url,
      name: `Image ${i + 1}`,
      origin: true,
    }));
  }
  if (initialUrl) {
    return [{ id: crypto.randomUUID(), preview: initialUrl, name: "Current image", origin: true }];
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

  const [items, setItems] = useState<DeferredItem[]>(() =>
    buildInitialItems(initialUrls, initialUrl),
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <>
      {/* Pass slug/bucket as hidden inputs for server action */}
      <input type="hidden" name={`${name}__slug`} value={slug} />
      <input type="hidden" name={`${name}__bucket`} value={bucket} />

      <UploadZone
        name={name}
        accept={accept}
        maxSizeMb={maxSizeMb}
        items={items}
        onItemsChange={setItems}
        onPreview={handlePreview}
        state={state}
        className={className}
        {...multipleProps}
      />

      <Lightbox
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        slides={items.map((i) => ({ src: i.preview, alt: i.name }))}
        index={previewIndex}
      />
    </>
  );
}
