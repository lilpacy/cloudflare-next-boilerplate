"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/app/_infrastructure/db";
import { users } from "@/app/_infrastructure/schema";
import { getBucket } from "@/app/_infrastructure/storage";

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
    const bucket = getBucket();
    const key = `profiles/${userId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Save to database
    const db = getDb();

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
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(users.userId, userId));
    } else {
      // Create new user
      await db.insert(users).values({
        userId,
        profileImageUrl: key,
        createdAt: sql`(unixepoch())`,
        updatedAt: sql`(unixepoch())`,
      });
    }

    revalidatePath("/profile");
    return { success: true, key };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteProfileImage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

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
    const bucket = getBucket();
    await bucket.delete(user.profileImageUrl);

    // Update database
    await db
      .update(users)
      .set({
        profileImageUrl: null,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(users.userId, userId));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete image");
  }
}
