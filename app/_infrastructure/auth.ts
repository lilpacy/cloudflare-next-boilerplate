import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return false;
  return adminEmails().has(email);
}

function adminEmails(): Set<string> {
  const configured = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    configured
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
  );
}
