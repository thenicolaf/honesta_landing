const siteUrl = process.env.PUBLIC_BASE_URL!;
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL!;
const instagramDmUrl = process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL!;

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
    {
      "@type": "ItemList",
      name: "HONESTA Dried Fruits Collection",
      description:
        "Handcrafted natural dried fruits with no sugar and no additives.",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Product",
            name: "Apple Pastila",
            description:
              "Pure apple, slowly dried and rolled by hand. No dye, no preservatives, no guilt.",
            category: "Kids Collection",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Product",
            name: "Dried Orange Slices",
            description:
              "Whole orange rings, air-dried to perfection. 100% natural, no sugar added.",
            category: "Clean Energy",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "Product",
            name: "Orange in Dark Chocolate",
            description:
              "Sun-dried orange, dipped in rich dark chocolate. An indulgence you don't have to justify.",
            category: "Gourmet Selection",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "Product",
            name: "Banana Pastila",
            description:
              "Ripe bananas, dried slowly until chewy and sweet. Kids-friendly, no sugar added.",
            category: "Kids Collection",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "Product",
            name: "Dried Banana",
            description:
              "Dense, naturally sweet banana chips. No sugar, no additives. Fuel for sport or office.",
            category: "Clean Energy",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
        {
          "@type": "ListItem",
          position: 6,
          item: {
            "@type": "Product",
            name: "Orange in Milk Chocolate",
            description:
              "Dried orange wrapped in silky milk chocolate. Gift-worthy.",
            category: "Gourmet Selection",
            brand: { "@id": `${siteUrl}/#organization` },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: instagramDmUrl,
            },
          },
        },
      ],
    },
  ],
};
