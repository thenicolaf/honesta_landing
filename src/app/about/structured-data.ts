export function buildAboutPageJsonLd(siteUrl: string) {
  const aboutUrl = `${siteUrl}/about`;

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${aboutUrl}#aboutpage`,
    name: "About HONESTA",
    description:
      "HONESTA is a family project crafting natural dried fruits, fruit leathers and crisps in Dubai — no added sugar, no additives, small batch and honest.",
    url: aboutUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    mainEntity: { "@id": `${siteUrl}/#organization` },
  };
}

export function buildAboutBreadcrumbJsonLd(siteUrl: string) {
  const aboutUrl = `${siteUrl}/about`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "About Us", item: aboutUrl },
    ],
  };
}
