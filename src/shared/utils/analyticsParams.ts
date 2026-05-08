export const GA_EVENT_PARAM = "_ga_event";
export const GA_METHOD_PARAM = "_ga_method";

/**
 * Append `_ga_event` (and optional `_ga_method`) query params to a redirect URL,
 * so a client-side dispatcher can fire the GA event after navigation.
 * Used from server actions where `sendGAEvent` is unavailable.
 */
export function withGAEvent(
  url: string,
  event: string,
  method?: string,
): string {
  const sep = url.includes("?") ? "&" : "?";
  const params = new URLSearchParams({ [GA_EVENT_PARAM]: event });
  if (method) params.set(GA_METHOD_PARAM, method);
  return `${url}${sep}${params.toString()}`;
}
