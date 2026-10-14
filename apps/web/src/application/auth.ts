import "server-only";

import { ForbiddenError, UnauthorizedError } from "@/domain/errors";
import { getCurrentUserId, isAdmin } from "@/infrastructure/auth";

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new UnauthorizedError();
  return userId;
}

export async function requireAdminUserId(): Promise<string> {
  const userId = await requireUserId();
  if (!(await isAdmin(userId))) throw new ForbiddenError("Admin access required");
  return userId;
}
