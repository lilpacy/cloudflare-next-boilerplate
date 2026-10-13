import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

// pnpm-lock.yaml and the real node_modules/.pnpm store live at the workspace root
// (two levels up from apps/web); Turbopack must see that root or it cannot follow
// the pnpm symlinks for hoisted packages such as `next` itself.
const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

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
    root: workspaceRoot,
  },
};

export default nextConfig;
