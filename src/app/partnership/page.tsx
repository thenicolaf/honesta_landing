import type { Metadata } from "next";
import { PartnershipPage } from "@/pages_flow/partnership/PartnershipPage";
import {
  buildPartnershipPageJsonLd,
  buildPartnershipBreadcrumbJsonLd,
} from "./structured-data";

const PARTNERSHIP_DESCRIPTION =
  "Bring HONESTA to your business. Wholesale and partnerships for restaurants, coffee shops, gyms, spas, hotels and event catering — honest, small-batch natural products, flexible volumes, personal service.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const partnershipUrl = `${siteUrl}/partnership`;

  return {
    title: "Partnership",
    description: PARTNERSHIP_DESCRIPTION,
    alternates: { canonical: partnershipUrl },
    openGraph: {
      title: "Partnership — HONESTA",
      description: PARTNERSHIP_DESCRIPTION,
      url: partnershipUrl,
      siteName: "HONESTA",
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-image.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Partnership — HONESTA",
      description: PARTNERSHIP_DESCRIPTION,
      images: ["/og-image.jpg"],
    },
  };
}

export default function Partnership() {
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return (
    <main className="grow">
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
