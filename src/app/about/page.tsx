import type { Metadata } from "next";
import { AboutUs } from "@/sections";
import {
  buildAboutPageJsonLd,
  buildAboutBreadcrumbJsonLd,
} from "./structured-data";

const ABOUT_DESCRIPTION =
  "HONESTA is a family project crafting natural dried fruits, fruit leathers and crisps in Dubai — 100% fruit, no added sugar, no additives. Discover our story, values and mission.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const aboutUrl = `${siteUrl}/about`;

  return {
    title: "About Us",
    description: ABOUT_DESCRIPTION,
    alternates: { canonical: aboutUrl },
    openGraph: {
      title: "About Us — HONESTA",
      description: ABOUT_DESCRIPTION,
      url: aboutUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "About Us — HONESTA",
      description: ABOUT_DESCRIPTION,
      images: ["/og-image.jpg"],
    },
  };
}

export default function AboutPage() {
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildAboutPageJsonLd(siteUrl)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildAboutBreadcrumbJsonLd(siteUrl)),
        }}
      />
      <AboutUs />
    </main>
  );
}
