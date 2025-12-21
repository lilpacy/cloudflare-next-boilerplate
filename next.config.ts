import type { NextConfig } from "next";

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // disable on Cloudflare workers
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // for uploading profile image
    },
  }
};

export default nextConfig;
