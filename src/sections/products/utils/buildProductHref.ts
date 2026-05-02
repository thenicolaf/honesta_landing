interface BuildProductHrefParams {
  slug?: string | null;
  from?: string;
}

/**
 * Build the canonical `/products/{slug}` href with optional `?from=` query param
 * used by the back-button resolver on the product detail page.
 *
 * Returns `undefined` if the product has no slug — caller decides how to render.
 */
export function buildProductHref({
  slug,
  from,
}: BuildProductHrefParams): string | undefined {
  if (!slug) return undefined;
  return `/products/${slug}${from ? `?from=${from}` : ""}`;
}
