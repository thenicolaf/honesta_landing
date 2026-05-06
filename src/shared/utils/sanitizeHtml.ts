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

/**
 * Strip all HTML tags and entities from a string, returning plain text suitable
 * for substring search or emptiness checks. Not a security boundary — use
 * {@link sanitizeNoteHtml} for anything that will be rendered as HTML.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHtmlEmpty(html: string | null | undefined): boolean {
  return stripHtml(html).length === 0;
}
