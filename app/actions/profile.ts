"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { getR2Bucket } from "@/lib/r2/client";

async function getDb() {
  const { env } = await getCloudflareContext();
  return drizzle(env.DB);
}

export async function getProfile() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .get();

  return user;
}

export async function uploadProfileImage(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("image") as File;

  if (!file || !file.size) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  try {
    const bucket = getR2Bucket();
    const key = `profiles/${userId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Save to database
    const db = await getDb();
    const now = new Date();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .get();

    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          profileImageUrl: key,
          updatedAt: now,
        })
        .where(eq(users.userId, userId));
    } else {
      // Create new user
      await db.insert(users).values({
        userId,
        profileImageUrl: key,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath("/profile");
    return { success: true, key };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function getProfileImageUrl(key: string | null | undefined) {
  if (!key) return null;

  try {
    const bucket = getR2Bucket();
    const object = await bucket.get(key);

    if (!object) {
      return null;
    }

    // Generate a temporary URL (you might want to use R2 public URLs or signed URLs in production)
    // For now, we'll return the key and handle it client-side
    return key;
  } catch (error) {
    console.error("Error getting image:", error);
    return null;
  }
}

export async function deleteProfileImage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();

  // Get current profile
  const user = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .get();

  if (!user || !user.profileImageUrl) {
    throw new Error("No profile image to delete");
  }

  try {
    const bucket = getR2Bucket();
    await bucket.delete(user.profileImageUrl);

    // Update database
    await db
      .update(users)
      .set({
        profileImageUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete image");
  }
}
