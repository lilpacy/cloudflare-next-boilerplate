// lib/db/client.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

// Server Componentsとルートハンドラー用
export const getDb = cache(() => {
  try {
    const { env } = getCloudflareContext();

    if (!env.DB) {
      throw new Error("DB binding is not available");
    }

    return drizzle(env.DB, { schema });
  } catch (error) {
    console.error("Failed to get DB:", error);
    throw error;
  }
});

// 静的生成（SSG）用の非同期版
export const getDbAsync = cache(async () => {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (!env.DB) {
      throw new Error("DB binding is not available");
    }

    return drizzle(env.DB, { schema });
  } catch (error) {
    console.error("Failed to get DB (async):", error);
    throw error;
  }
});
