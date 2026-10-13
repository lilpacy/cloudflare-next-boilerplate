import type { NextConfig } from "next";

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  transpilePackages: ["@cf-next/database", "@cf-next/ui"],
  images: {
    unoptimized: true, // disable on Cloudflare workers
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // for uploading profile image
    },
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
