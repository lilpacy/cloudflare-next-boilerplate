import { notFound, redirect } from "next/navigation";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/domain/errors";

/**
 * Maps Domain errors thrown by Application functions to page-level responses.
 * Use as `await useCase().catch(handlePageError)` so that `redirect`/`notFound`
 * are invoked outside any `try` block, as the Next.js docs require.
 */
export function handlePageError(error: unknown): never {
  if (error instanceof UnauthorizedError) redirect("/sign-in");
  if (error instanceof ForbiddenError) redirect("/");
  if (error instanceof NotFoundError) notFound();
  throw error;
}
