import type { Metadata } from "next";

const siteUrl = process.env.PUBLIC_BASE_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HONESTA — Natural Dried Fruits. No Sugar. No Additives.",
    template: "%s — HONESTA",
  },
  description:
    "Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives. Small batch production with love.",
  keywords: [
    "dried fruits online",
    "natural fruit snacks no sugar",
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
