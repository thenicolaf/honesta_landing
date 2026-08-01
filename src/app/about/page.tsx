import type { Metadata } from "next";
import { AboutUs, TrustMarks } from "@/sections";
import {
  buildAboutPageJsonLd,
  buildAboutBreadcrumbJsonLd,
} from "./structured-data";

const ABOUT_TITLE = "About HONESTA | Premium Natural Food Brand in UAE";
const ABOUT_DESCRIPTION =
  "Learn about HONESTA, a UAE-based family brand creating dried fruits, fruit rolls, dried vegetables, ghee, jerky and other thoughtfully made foods.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const aboutUrl = `${siteUrl}/about`;

  return {
    title: { absolute: ABOUT_TITLE },
    description: ABOUT_DESCRIPTION,
    alternates: { canonical: aboutUrl },
    openGraph: {
      title: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      url: aboutUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      images: ["/og-image.webp"],
    },
  };
}

export default function AboutPage() {
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow">
      <TrustMarks />
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
