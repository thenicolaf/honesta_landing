const siteUrl = process.env.PUBLIC_BASE_URL!;
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL!;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${siteUrl}/#organization`,
      name: "HONESTA",
      url: siteUrl,
      description:
        "Handcrafted natural dried fruits. No added sugar, no additives. Small batch production.",
      sameAs: [instagramUrl],
      address: {
        "@type": "PostalAddress",
        addressCountry: "AE",
        addressRegion: "Dubai",
      },
      areaServed: {
        "@type": "Country",
        name: "United Arab Emirates",
      },
      currenciesAccepted: "AED",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "HONESTA",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?category={search_term_string}#products`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "HONESTA — Natural Dried Fruits. No Added Sugar. No Additives.",
      description:
        "Handcrafted dried fruits and pastila. 100% fruit. No Added sugar. No additives.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
