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
        "Premium natural foods made in the UAE. Real ingredients, honest taste. Nothing else.",
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
          urlTemplate: `${siteUrl}/shop?category={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "HONESTA — Premium Natural Foods Made in UAE",
      description:
        "Premium natural foods made in the UAE — dried fruits, fruit rolls, dried vegetables, ghee, jerky and gifts. Real ingredients, honest taste.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
