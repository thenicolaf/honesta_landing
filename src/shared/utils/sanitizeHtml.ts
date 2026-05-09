import sanitizeHtml from "sanitize-html";

const NOTE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
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
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": [
      "style",
      "data-text-color",
      "data-background-color",
      "data-text-alignment",
    ],
  },
  // Pass `style` attribute through verbatim (matches old DOMPurify behaviour).
  // BlockNote's `tryParseHTMLToBlocks` reads inline `style="color: #hex"` to
  // restore color marks — sanitize-html's style normalization breaks that round-trip.
  parseStyleAttributes: false,
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

export function sanitizeNoteHtml(html: string): string {
  return sanitizeHtml(html, NOTE_CONFIG);
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
