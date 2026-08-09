import type { Metadata } from "next";
import { PartnershipPage } from "@/pages_flow/partnership/PartnershipPage";
import { TrustMarks } from "@/sections";
import {
  buildPartnershipPageJsonLd,
  buildPartnershipBreadcrumbJsonLd,
} from "./structured-data";

const PARTNERSHIP_TITLE = "Wholesale Natural Food Supplier in UAE | HONESTA";
const PARTNERSHIP_DESCRIPTION =
  "Partner with HONESTA for premium natural foods made in the UAE. Wholesale solutions for cafés, restaurants, hotels, gyms, retailers and events.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const partnershipUrl = `${siteUrl}/partnership`;

  return {
    title: { absolute: PARTNERSHIP_TITLE },
    description: PARTNERSHIP_DESCRIPTION,
    alternates: { canonical: partnershipUrl },
    openGraph: {
      title: PARTNERSHIP_TITLE,
      description: PARTNERSHIP_DESCRIPTION,
      url: partnershipUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title: PARTNERSHIP_TITLE,
      description: PARTNERSHIP_DESCRIPTION,
      images: ["/og-image.webp"],
    },
  };
}

export default function Partnership() {
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow">
      <TrustMarks />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPartnershipPageJsonLd(siteUrl)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPartnershipBreadcrumbJsonLd(siteUrl)),
        }}
      />
      <PartnershipPage />
    </main>
  );
}
