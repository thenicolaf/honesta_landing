export const CUSTOMER_COOKIE_KEY = "honesta_customer";
export const COORDINATES_KEY = "honesta_coordinates";
export const COOKIE_CONSENT_KEY = "honesta_cookie_consent";
export const PUSH_OPT_OUT_KEY = "honesta_push_opt_out";
export const PRODUCTS_SHUFFLE_SEED_COOKIE = "honesta_products_shuffle_seed";

/**
 * Feature flag for the Google Maps address experience — the interactive map,
 * Google Places autocomplete, and the optional "Area" address field/validation.
 *
 * Enabled by default: unset OR empty OR any value keeps it ON. To disable
 * (hide the map + Area field and skip Area validation — e.g. when the Google
 * Maps subscription lapses), set `NEXT_PUBLIC_GOOGLE_MAPS_ENABLED="false"`
 * explicitly. Works on both client and server (NEXT_PUBLIC is inlined at build).
 */
export const GOOGLE_MAPS_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_ENABLED?.trim().toLowerCase() !== "false";

export const UAE_EMIRATES = [
  { value: "Abu Dhabi", label: "Abu Dhabi" },
  { value: "Ajman", label: "Ajman" },
  { value: "Dubai", label: "Dubai" },
  { value: "Fujairah", label: "Fujairah" },
  { value: "Ras Al Khaimah", label: "Ras Al Khaimah" },
  { value: "Sharjah", label: "Sharjah" },
  { value: "Umm Al Quwain", label: "Umm Al Quwain" },
] as const;

export const DEFAULT_EMIRATE = "Dubai";
