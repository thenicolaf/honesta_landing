import DOMPurify from "isomorphic-dompurify";

const NOTE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "span",
    "strong",
    "em",
    "u",
    "s",
    "ol",
    "ul",
    "li",
    "a",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "style",
    "data-text-color",
    "data-background-color",
    "data-text-alignment",
  ],
};

export function sanitizeNoteHtml(html: string): string {
  return DOMPurify.sanitize(html, NOTE_CONFIG);
}

export function isHtmlEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();
  return stripped.length === 0;
}
