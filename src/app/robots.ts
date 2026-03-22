import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.PUBLIC_BASE_URL!;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel/", "/checkout/", "/auth/", "/verify-email", "/forgot-password", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
