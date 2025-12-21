import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getR2Bucket() {
  const { env } = getCloudflareContext();
  return env.R2_BUCKET;
}

export async function uploadImage(
  file: File,
  folder: string = "posts"
): Promise<{ key: string; url: string }> {
  const bucket = getR2Bucket();
  const key = `${folder}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // 公開URLを生成（R2 public URL）
  const url = `https://hono-blog.com/images/${key}`;

  return { key, url };
}

export async function deleteImage(key: string): Promise<void> {
  const bucket = getR2Bucket();
  await bucket.delete(key);
}
