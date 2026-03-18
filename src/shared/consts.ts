export const CUSTOMER_COOKIE_KEY = "honesta_customer";
export const COORDINATES_KEY = "honesta_coordinates";
export const COOKIE_CONSENT_KEY = "honesta_cookie_consent";
export const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 25);

export const UAE_EMIRATES = [
  { value: "Abu Dhabi", label: "Abu Dhabi" },
  { value: "Ajman", label: "Ajman" },
  { value: "Dubai", label: "Dubai" },
  { value: "Fujairah", label: "Fujairah" },
  { value: "Ras Al Khaimah", label: "Ras Al Khaimah" },
  { value: "Sharjah", label: "Sharjah" },
  { value: "Umm Al Quwain", label: "Umm Al Quwain" },
] as const;
