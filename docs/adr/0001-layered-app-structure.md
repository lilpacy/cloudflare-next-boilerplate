# ADR-0001: Layered structure for application code under `app/`

- **Status:** Accepted (applies to new code immediately; existing code is migrated per [ARCHITECTURE.md](../../ARCHITECTURE.md#migration-status))
- **Superseded in part by:** [ADR-0002](0002-src-layer-directories.md) moves the layers from `app/_<layer>/` to `src/<layer>/`. Paths below are as of this decision
- **Date:** 2026-10-14
- **Deciders:** lilpacy

This record explains *why* the structure in [ARCHITECTURE.md](../../ARCHITECTURE.md) was chosen.
It is history; read ARCHITECTURE.md for the current rules.

## Context

The app has two features (todos, profile) plus an admin stats page. All server logic lives in two
`"use server"` files, `app/actions/todos.ts` and `app/actions/profile.ts`. Reviewing them against the
Next.js 16 data-security guide surfaced these problems (as of commit `b899a74`; referenced by
function name because line numbers go stale):

| Problem | Where |
|---|---|
| Read functions (`getTodos`, `getTodoById`, `getProfile`, `getAllTodosStatsForAdmin`) are exported from `"use server"` files, so each is a POST endpoint reachable by any signed-in user | `app/actions/todos.ts`, `app/actions/profile.ts` |
| `auth()` + "Unauthorized" check is copied 9 times | every exported function in `app/actions/*.ts` |
| Admin check (`ADMIN_EMAILS`) is implemented twice | `middleware.ts` (`clerkMiddleware` callback), `app/actions/todos.ts` (`getAllTodosStatsForAdmin`) |
| `getDb()` is redefined per actions file; `lib/db/client.ts` is unused | top of `app/actions/todos.ts` and `app/actions/profile.ts` |
| DB rows (including `userId`) are passed to Client Components; the `Todo` type is hand-written twice | `app/todos/components/TodoList.tsx`, `app/todos/[id]/EditTodoForm.tsx` |
| Image size/MIME validation is duplicated on client and server | `app/profile/components/ProfileForm.tsx`, `app/actions/profile.ts` |
| `/api/images/[...key]` has no authorization; anyone who knows a key can read any image | `app/api/images/[...key]/route.ts` |
| `middleware.ts` is deprecated in Next 16 (renamed `proxy.ts`) | `middleware.ts` |
| `lib/r2/client.ts` contains unused `uploadImage` with a hard-coded foreign hostname | `lib/r2/client.ts` |

The first problem is the one that layering must solve. Per the Next.js docs, a Server Action
"runs as a POST request against the page that invokes it" and "the route is reachable to anyone
who can send the same POST" (`server-actions.md`), so reads should not be actions and path-based
middleware cannot protect actions.

## Decision

Adopt a four-layer structure (UI / Application / Domain / Infrastructure, Evans' names) with the
Application layer playing the role of the Next.js Data Access Layer. Place the non-UI layers inside
`app/` as private folders (`app/_application`, `app/_domain`, `app/_infrastructure`). Enforce the
dependency rule with ESLint `no-restricted-imports` and boundary tests. Full rules: ARCHITECTURE.md.

## Alternatives considered

| Option | Pros | Cons | Outcome |
|---|---|---|---|
| **`app/_layer/` private folders** | Next.js docs explicitly list private folders for "separating UI logic from routing logic"; one tree holds all app code | `proxy.ts` and `drizzle.config.ts` reference paths inside `app/` | **Chosen** |
| `src/{domain,application,infrastructure}/` outside `app/` | Visible from the repo root | Two parallel trees (`app/` and `src/`) for no functional gain | Rejected |
| Nx library projects (`packages/domain`, `packages/server`) | Reuses the existing `depConstraints` and boundary test | Extra `package.json`/`tsconfig` per layer; overkill for one app. Whether Nx assigns `@/*` alias imports to nested projects correctly is unverified | Deferred until a second app exists |
| Keep queries inside Application (as in the Next.js DAL example) instead of a repository module per feature | One file fewer per feature | Application would import `drizzle-orm`, so the lintable rule "SDK imports only in Infrastructure" would not hold, and unit tests would need a database | Rejected |
| Repository interfaces + dependency injection | Textbook Dependency Rule compliance; Application testable without mocks | Two features do not justify it; Fowler notes data-source substitution is rarely done in practice | Rejected for now |
| Keep admin authorization in `proxy.ts` | Non-admins are redirected before rendering | Path matching cannot protect Server Actions; the same check would still be needed in Application, so it would stay duplicated | Rejected; proxy does authentication redirect only |
| Use `unauthorized()` / `forbidden()` from Next.js | Built-in 401/403 pages | Requires experimental `authInterrupts` | Rejected for now |

## Consequences

Positive:

- Reads are no longer public endpoints; only mutations are exported from `"use server"` files.
- Authentication/authorization and SDK access each have one home, so a lint rule can prove it.
- Client Components receive audience-specific DTOs; DB rows stop at Infrastructure.
- Validation rules are written once in Domain and used on both sides.

Negative / accepted trade-offs:

- Application unit tests mock Infrastructure modules with `vi.mock`; there is no interface to substitute.
- Every feature needs up to four files (domain, application, infrastructure, actions). For a tiny
  feature this is more ceremony than a single actions file.
- The documentation describes the target structure before the code matches it. Until migration
  finishes, `lib/` and `app/actions/` coexist with the new folders.

## Migration plan

Ordered so that the biggest security gain (step 2) can ship as its own PR.

1. Create `app/_domain/` and `app/_infrastructure/` (moves from `lib/`); point `drizzle.config.ts` at the new schema path; delete unused `uploadImage`.
2. Move the four read functions into `app/_application/` and call them from Server Components; convert `app/admin/page.tsx` to a Server Component.
3. Thin out mutation actions; add `app/_lib/action-result.ts` and Domain error classes.
4. Rename `middleware.ts` to `proxy.ts`; remove the admin check from it.
5. Add per-layer `no-restricted-imports` to `eslint.config.mjs` and cases to `__tests__/module-boundaries.test.ts`.
6. Route `/api/images/[...key]` through `readProfileImage(key)` with an ownership check; stop showing the R2 key in `ProfileForm`.
7. Update `AGENTS.md` project-structure wording and tick the checklist in ARCHITECTURE.md.

## Open questions

- Whether `proxy.ts` (Node runtime by default in Next 16) runs unchanged on OpenNext Cloudflare. Expected to behave like the previous middleware; not verified.
- Whether a module that imports `server-only` can be imported from `proxy.ts`. To avoid the question, `proxy.ts` uses Clerk's `auth()` directly and does not import Infrastructure.
- Whether `drizzle-orm` with `better-sqlite3` (already a devDependency) is a practical way to test Infrastructure modules without D1.

## Amendments

Recorded during the migration (PRs #16, #17 and the follow-up middleware/docs PR), 2026-10-14.

| Plan item | Amendment | Reason |
|---|---|---|
| Step 4: rename `middleware.ts` to `proxy.ts` | Not renamed. Only the admin check was removed; the file keeps the Edge-runtime `clerkMiddleware` | README "Next.js 16 compatibility": the Node.js runtime used by `proxy.ts` is not supported by the OpenNext Cloudflare adapter. The first two open questions above stay open until the adapter supports it |
| Code map: `app/<route>/_components/`, `app/_components/` | Existing `components/` directories are kept as is | A folder without `page.tsx` is already excluded from routing, so the private-folder prefix adds churn without effect |
| Consequence: "Application unit tests mock Infrastructure modules" | Confirmed. Vitest resolves `server-only` to `__tests__/stubs/server-only.ts` (the real module throws outside React Server Components), and `server-only` is a declared dependency because the Nx `banTransitiveDependencies` rule rejects unlisted imports | Needed to import `app/_application/*` in tests at all |
| Step 1: "delete unused `uploadImage`" | Done in step 1; the rest of `lib/r2` was removed in step 3/6 (PR #17) because the image route still used it | Keeps every PR buildable on its own |
| Infrastructure testing (third open question) | Not pursued. Query semantics (ordering, owner scoping, aggregates) are covered only by the Playwright suite against the local D1; no `better-sqlite3` harness was added | Recorded as a known gap, not a decision against it |

## References

- Next.js 16.3.8 bundled docs: `01-app/02-guides/data-security.md`, `01-app/02-guides/server-actions.md`, `01-app/01-getting-started/02-project-structure.md`, `01-app/03-api-reference/04-functions/unauthorized.md`
- Eric Evans, *DDD Reference* (2015), "Layered Architecture"
- Martin Fowler, "Presentation Domain Data Layering"
- Robert C. Martin, "The Clean Architecture" (2012)
