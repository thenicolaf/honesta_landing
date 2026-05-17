import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Next 16 middleware proxy caps request body at 10 MB by default, which
    // truncates large multipart uploads (video files) before they reach the
    // server action handler. Bump to match serverActions.bodySizeLimit.
    proxyClientMaxBodySize: "100mb",
    optimizePackageImports: [
      "@/shared/ui",
      "@/shared/icons",
      "@/sections",
      "motion/react",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cgqmggehyrriorehbcgo.supabase.co",
      },
      {
        protocol: "https",
        hostname: "tcucwizupntwctwhumzk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
