export function buildPartnershipPageJsonLd(siteUrl: string) {
  const partnershipUrl = `${siteUrl}/partnership`;

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${partnershipUrl}#contactpage`,
    name: "Partnership — HONESTA",
    description:
      "Wholesale and partnerships with HONESTA. We supply restaurants, coffee shops, gyms, spas, hotels and event catering with honest, small-batch natural products.",
    url: partnershipUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    mainEntity: { "@id": `${siteUrl}/#organization` },
  };
}

export function buildPartnershipBreadcrumbJsonLd(siteUrl: string) {
  const partnershipUrl = `${siteUrl}/partnership`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Partnership",
        item: partnershipUrl,
      },
    ],
  };
}
