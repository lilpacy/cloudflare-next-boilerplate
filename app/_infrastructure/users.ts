import "server-only";

import { eq } from "drizzle-orm";
import type { Profile } from "@/app/_domain/profile";
import { getDb } from "./db";
import { users } from "./schema";

export async function findProfile(userId: string): Promise<Profile> {
  const row = await getDb()
    .select({ imageKey: users.profileImageUrl })
    .from(users)
    .where(eq(users.userId, userId))
    .get();
  return { imageKey: row?.imageKey ?? null };
}
