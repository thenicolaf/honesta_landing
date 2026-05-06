import { cn } from "@/shared/utils/cn";

interface RichTextProps {
  html: string;
  className?: string;
}

// HTML is sanitized at write time in product actions.ts via sanitizeNoteHtml.
// Trust the DB here to avoid running jsdom-backed DOMPurify on every server render.
export function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
