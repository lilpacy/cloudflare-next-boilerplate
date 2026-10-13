import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ProfileImage } from "@/domain/profile-image";

function getBucket(): R2Bucket {
  const { env } = getCloudflareContext();
  if (!env.R2_BUCKET) throw new Error("R2_BUCKET binding is not available");
  return env.R2_BUCKET;
}

export async function putObject(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
  await getBucket().put(key, body, { httpMetadata: { contentType } });
}

export async function getObject(key: string): Promise<ProfileImage | null> {
  const object = await getBucket().get(key);
  if (!object) return null;
  return {
    contentType: object.httpMetadata?.contentType ?? "image/jpeg",
    body: object.body,
  };
}

export async function deleteObject(key: string): Promise<void> {
  await getBucket().delete(key);
}
