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
    default: "HONESTA — Natural Dried Fruits. No Added Sugar. No Additives.",
    template: "%s — HONESTA",
  },
  description:
    "Handcrafted dried fruits and pastila. 100% fruit. No added sugar. No additives. Small batch production with love.",
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
    title: "HONESTA — Natural Dried Fruits",
    description: "Honest. Simple. No additives. Small Batch & Handcrafted.",
    url: siteUrl,
    siteName: "HONESTA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HONESTA Natural Dried Fruits — Honest. Simple. No Additives.",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HONESTA — Natural Dried Fruits",
    description: "Honest. Simple. No additives. Small Batch & Handcrafted.",
    images: ["/og-image.jpg"],
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
