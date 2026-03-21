"use client";

import { useState } from "react";
import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormCheckbox,
  FormUploadZone,
  FormError,
} from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

function getInitialUrls(product?: SectionProps["product"]): string[] | undefined {
  if (!product) return undefined;
  const urls = [product.image_url, ...(product.images ?? [])].filter(
    (url): url is string => !!url,
  );
  return urls.length > 0 ? urls : undefined;
}

export function BasicInfoSection({ product, state }: SectionProps) {
  const [inStock, setInStock] = useState(product?.in_stock !== false);

  return (
    <SectionCard>
      <SectionLabel>Basic info</SectionLabel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormLabel htmlFor="p-title">Title *</FormLabel>
          <FormInput
            id="p-title"
            name="title"
            placeholder="e.g. Sun-Dried Apple Rings"
            defaultValue={state?.values?.title ?? product?.title ?? ""}
            state={state?.fieldErrors?.title ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.title} />
        </div>

        <div className="sm:col-span-2">
          <FormLabel htmlFor="p-tagline">Tagline</FormLabel>
          <FormTextarea
            id="p-tagline"
            name="tagline"
            rows={3}
            placeholder="e.g. Crispy, sweet, naturally dried"
            defaultValue={state?.values?.tagline ?? product?.tagline ?? ""}
          />
        </div>

        <div>
          <FormLabel htmlFor="p-badge">Badge</FormLabel>
          <FormInput
            id="p-badge"
            name="badge"
            placeholder="e.g. Natural"
            defaultValue={state?.values?.badge ?? product?.badge ?? ""}
          />
        </div>

        <div className="flex flex-col justify-end">
          <FormLabel htmlFor="p-instock">In stock</FormLabel>
          <FormCheckbox
            id="p-instock"
            name="in_stock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            label={inStock ? "In stock" : "Out of stock"}
            className="h-11.5 flex items-center"
          />
        </div>

        <div className="sm:col-span-2">
          <FormLabel>Images</FormLabel>
          <FormUploadZone
            name="images"
            multiple={true}
            maxFiles={8}
            initialUrls={getInitialUrls(product)}
            slug="product"
            state={state?.fieldErrors?.images ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.images} />
        </div>
      </div>
    </SectionCard>
  );
}
