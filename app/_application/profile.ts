import "server-only";

import type { Profile } from "@/app/_domain/profile";
import { findProfile } from "@/app/_infrastructure/users";
import { requireUserId } from "./auth";

export async function getProfile(): Promise<Profile> {
  const userId = await requireUserId();
  return findProfile(userId);
}
