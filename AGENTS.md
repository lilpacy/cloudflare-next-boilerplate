# Repository Guidelines

## Project Structure & Module Organization
- `apps/web/src/` holds application code in four layers, one directory each: `apps/web/src/domain/`, `apps/web/src/application/`, `apps/web/src/infrastructure/` and the UI layer `apps/web/src/app/` (the Next.js App Router) plus `apps/web/src/middleware.ts`. Read `ARCHITECTURE.md` before adding or moving server-side code; it defines which directory each kind of code belongs in and which imports are allowed (per-layer `no-restricted-imports` rules in `eslint.config.mjs` enforce them). Server Actions live next to their route as `apps/web/src/app/<route>/actions.ts` and export mutations only.
- Workspace packages: `packages/ui` holds presentation-only React components; `packages/database` (`@cf-next/database`) holds table definitions (`packages/database/src/modules/<name>/schema.ts`, registered in `packages/database/src/schema.ts`), `createDb(d1)` and `migrations/`. Only `apps/web/src/infrastructure/` may import `@cf-next/database`; queries, Clerk and storage logic stay in the app. `apps/*` may import `packages/*`; the reverse (`packages/*` importing from `apps/*`) is forbidden by the Nx `depConstraints` in `eslint.config.mjs` (`type:ui`/`type:database` cannot depend on `type:app`) and covered by `__tests__/module-boundaries.test.ts`. `pnpm lint` enforces Nx project boundaries and cross-project cycle restrictions.
- Database migrations sit in `packages/database/migrations/`; keep SQL files in sync with generated metadata (`packages/database/test/migrations.test.ts` fails on drift). Static assets belong in `public/`, and deployment wiring is captured by `apps/web/open-next.config.ts`, `apps/web/wrangler.jsonc` and `.github/workflows/deploy-preview.yml` (preview deploy on every `master` push) and `.github/workflows/deploy-production.yml` (manual production deploy from `master`).

## Build, Test, and Development Commands
- `pnpm run dev` starts the local dev server with Turbopack.
- `pnpm run build` creates a production bundle; `pnpm run start` runs it on the Next.js Node server. Use `pnpm run preview:cf` to build and run it locally in the Cloudflare Workers runtime with D1/R2 bindings.
- `pnpm run lint` runs the configured ESLint ruleset; fix warnings before opening a PR.
- `pnpm run deploy` (production) and `pnpm run deploy:preview` build and ship via OpenNext + Cloudflare. Run `pnpm run cf:typegen` after editing bindings or vars in `apps/web/wrangler.jsonc`; it regenerates `cloudflare-env.d.ts`.
- Database helpers: `pnpm run db:generate` creates a migration from `packages/database/src/schema.ts`; `pnpm run db:migrate:local`, `db:migrate:preview` and `db:migrate:prod` apply migrations; use the paired `db:shell:*` commands for ad-hoc queries.

## Coding Style & Naming Conventions
- TypeScript is required; prefer explicit types on exported functions. Use 2-space indentation and keep imports sorted logically (React/Next, third-party, local).
- Components and server actions follow PascalCase filenames; route handlers stay lowercase (`route.ts`, `layout.tsx`). Tailwind classes drive styling—share design tokens via `apps/web/src/app/styles` when possible.
- Run ESLint before committing; add targeted `// eslint-disable-next-line` comments only when justified.

## Testing Guidelines
- Vitest tests (`pnpm run test:run`) for a single module sit next to it as `<module>.test.ts` (e.g. `apps/web/src/application/todos.test.ts`, `apps/web/src/app/api/images/[...key]/route.test.ts`), so the per-layer lint rules apply to them too. `__tests__/` keeps only cross-cutting tests (sample rendering, the Nx dependency-boundary contract, the E2E resource fixture lifecycle) and `stubs/`. Use Japanese behavior names for new tests. Keep boundary checks covering aliases, relative imports, project cycles and the per-layer rules under `apps/web/src/`.
- Every component exported from `packages/ui/src/index.ts` needs a sibling `<Name>.stories.tsx`; `packages/ui/src/stories-coverage.test.ts` fails when one is missing, and `storybook:test` only exercises components that have stories.
- Always run `pnpm run lint` and `pnpm run build` before pushing. For database changes, exercise migrations locally via `db:migrate:local` and seed data through the D1 shell commands. Playwright E2E tests live in `e2e/` (`pnpm run test:e2e`); see the README for Clerk test-instance requirements.

## Commit & Pull Request Guidelines
- History shows short imperative commits (`fix: upload image`, `add rss feed...`). Follow `type: summary (context)` with optional issue reference `(vibe-kanban XXXXX)`.
- Squash local work into logical commits. PRs should describe the change, list manual checks (lint/build/migrations), attach screenshots for UI updates, and link tracking tickets. Request review before merging to `master`.

## Security & Configuration Tips
- Secrets live in Cloudflare env vars; never commit credentials. Add non-secret keys to `apps/web/wrangler.jsonc` `vars` and secrets via `wrangler secret put`, run `pnpm run cf:typegen` to regenerate `cloudflare-env.d.ts`, and verify `apps/web/wrangler.jsonc` stays in sync with deployed bindings.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
