import "server-only";

import { createDb } from "@cf-next/database";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  if (!env.DB) throw new Error("DB binding is not available");
  return createDb(env.DB);
});
