import { DomainError } from "@/domain/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Runs a mutation from a Server Action and turns Domain errors into a result
 * the client can show. Unexpected errors are rethrown so Next.js reports them.
 */
export async function runAction<T>(mutation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await mutation() };
  } catch (error) {
    if (error instanceof DomainError) return { ok: false, error: error.message };
    throw error;
  }
}
