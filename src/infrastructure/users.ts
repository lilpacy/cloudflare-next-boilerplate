import "server-only";

import { users } from "@cf-next/database";
import { eq, sql } from "drizzle-orm";
import type { Profile } from "@/domain/profile";
import { getDb } from "./db";

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
