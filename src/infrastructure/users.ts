import "server-only";

import { eq, sql } from "drizzle-orm";
import type { Profile } from "@/domain/profile";
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

export async function setProfileImageKey(userId: string, imageKey: string | null): Promise<void> {
  await getDb()
    .insert(users)
    .values({ userId, profileImageUrl: imageKey })
    .onConflictDoUpdate({
      target: users.userId,
      set: { profileImageUrl: imageKey, updatedAt: sql`(unixepoch())` },
    });
}
