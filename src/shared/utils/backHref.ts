/**
 * Helpers for the "preserve filters on Back navigation" pattern.
 *
 * Pages that show filterable lists (home `#products`, `/panel/products`, …)
 * encode their current pathname + search params into a `?back=` query param
 * on outbound links to detail pages. The detail page reads `back`, validates
 * it via `isSafeBackHref`, and uses it as the back-button href so the user
 * returns to the same scrolled, filtered view.
 *
 * Pair with [src/sections/products/utils/buildProductHref.ts](src/sections/products/utils/buildProductHref.ts)
 * which serialises `backHref` into the outbound `/products/{slug}?back=…` URL.
 */

interface BuildBackHrefParams {
  /** Path of the list page (e.g. "/", "/panel/products"). */
  pathname: string;
  /** Current search params — usually `useSearchParams()` from `next/navigation`. */
  searchParams: { toString(): string } | null;
  /** Optional fragment (e.g. "#products") to scroll back into view. */
  hash?: string;
}

/**
 * Build the URL that goes into a detail link's `?back=` query param.
 * Combines pathname + search params + optional hash.
 */
export function buildBackHref({
  pathname,
  searchParams,
  hash,
}: BuildBackHrefParams): string {
  const queryString = searchParams?.toString() ?? "";
  return `${pathname}${queryString ? `?${queryString}` : ""}${hash ?? ""}`;
}

/**
 * Same-origin guard — only relative paths can override the back href on the
 * detail page. Rejects absolute URLs and protocol-relative `//evil.com/…`.
 */
export function isSafeBackHref(url: string | undefined | null): url is string {
  return !!url && url.startsWith("/") && !url.startsWith("//");
}
