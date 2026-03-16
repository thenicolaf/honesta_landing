const siteUrl = process.env.PUBLIC_BASE_URL!;
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL!;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HONESTA",
      url: siteUrl,
      description:
        "Handcrafted natural dried fruits. No sugar, no additives. Small batch production.",
      sameAs: [instagramUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "HONESTA",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "HONESTA — Natural Dried Fruits. No Sugar. No Additives.",
      description:
        "Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
