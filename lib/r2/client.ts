import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getR2Bucket() {
  const { env } = getCloudflareContext();
  return env.R2_BUCKET;
}
