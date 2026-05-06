interface BuildProductHrefParams {
  slug?: string | null;
  from?: string;
  /** Full back URL (path + query + hash) to preserve filter state when returning from the detail page. */
  backHref?: string;
}

/**
 * Build the canonical `/products/{slug}` href with optional `?from=` and `?back=`
 * query params used by the back-button resolver on the product detail page.
 *
 * `from` is a key looked up in `FROM_MAP` for the back-button **label**
 * ("Back to cart", "Back to products", …). `backHref` overrides the static
 * `FROM_MAP[from].href` and lets the caller carry the full URL (including
 * filter query string) so the user lands on the same scrolled, filtered list.
 *
 * Returns `undefined` if the product has no slug — caller decides how to render.
 */
export function buildProductHref({
  slug,
  from,
  backHref,
}: BuildProductHrefParams): string | undefined {
  if (!slug) return undefined;
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (backHref) query.set("back", backHref);
  const queryString = query.toString();
  return `/products/${slug}${queryString ? `?${queryString}` : ""}`;
}
