import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getBucket(): R2Bucket {
  const { env } = getCloudflareContext();
  if (!env.R2_BUCKET) throw new Error("R2_BUCKET binding is not available");
  return env.R2_BUCKET;
}
