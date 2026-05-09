"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const Editor = dynamic(() => import("./BlockNoteEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-32 rounded-xl bg-sand/40 animate-pulse" aria-hidden />
  ),
});

const wrapperVariants = cva(
  "rich-text-editor border rounded-xl bg-cream font-body text-earth transition-colors overflow-hidden",
  {
    variants: {
      state: {
        default: "border-parchment focus-within:border-orange",
        error: "border-red-400 focus-within:border-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

type WrapperVariantProps = VariantProps<typeof wrapperVariants>;

interface FormRichTextareaProps extends WrapperVariantProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function FormRichTextarea({
  name,
  defaultValue,
  placeholder,
  id,
  className,
  state,
}: FormRichTextareaProps) {
  const [html, setHtml] = useState(defaultValue ?? "");
  // Adjust state in-render when defaultValue changes (e.g. server action
  // echoes submitted values back). Editor is keyed on defaultValue so it
  // remounts with the new initialHtml — BlockNote only reads it at mount.
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue ?? "");
  if ((defaultValue ?? "") !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue ?? "");
    setHtml(defaultValue ?? "");
  }

  return (
    <div
      id={id}
      className={cn(wrapperVariants({ state }), className)}
      // Block desktop right-click and any contextmenu the browser still
      // dispatches on long-press selection. Combined with the iOS
      // `-webkit-touch-callout: none` rule, this leaves only BlockNote's
      // formatting toolbar visible above selected text on supported browsers.
      onContextMenu={(e) => e.preventDefault()}
    >
      <Editor
        key={prevDefaultValue}
        initialHtml={defaultValue ?? ""}
        placeholder={placeholder}
        onHtmlChange={setHtml}
      />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
