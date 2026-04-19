import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/productsDb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.PUBLIC_BASE_URL!;
  const products = await getPublishedSlugs();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/mix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...productUrls,
  ];
}
