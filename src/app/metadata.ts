import type { Metadata } from "next";

const siteUrl = process.env.PUBLIC_BASE_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  title: {
    default: "HONESTA — Premium Natural Foods Made in UAE",
    template: "%s — HONESTA",
  },
  description:
    "Discover HONESTA premium natural foods made in the UAE, including dried fruits, fruit rolls, dried vegetables, ghee, jerky and curated gifts. Real ingredients, honest taste.",
  keywords: [
    "dried fruits online",
    "natural fruit snacks no added sugar",
    "handcrafted dried orange",
    "healthy snacks for kids",
    "small batch dried fruit",
    "chocolate covered dried fruit gift",
    "no additives fruit snack",
    "apple pastila",
    "banana pastila",
    "dried orange slices",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "HONESTA — Premium Natural Foods Made in UAE",
    description:
      "Real ingredients, honest taste. Premium natural foods made in the UAE.",
    url: siteUrl,
    siteName: "HONESTA",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "HONESTA — Premium Natural Foods Made in the UAE",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HONESTA — Premium Natural Foods Made in UAE",
    description:
      "Real ingredients, honest taste. Premium natural foods made in the UAE.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};
