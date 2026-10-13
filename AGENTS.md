# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router and is organized in four layers (UI / Application / Domain / Infrastructure). Read `ARCHITECTURE.md` before adding or moving server-side code; it defines which directory each kind of code belongs in and which imports are allowed. `lib/` and `app/actions/` are legacy locations being migrated; do not add to them.
- Shared presentation-only React components live in `packages/ui`; keep Clerk, database and storage logic in the app. `pnpm lint` enforces Nx project boundaries and cross-project cycle restrictions.
- Database migrations sit in `drizzle/`; keep SQL files in sync with generated metadata. Static assets belong in `public/`, and deployment wiring is captured by `open-next.config.ts`, `wrangler.jsonc` and `.github/workflows/deploy-preview.yml` (preview deploy on every `master` push) and `.github/workflows/deploy-production.yml` (manual production deploy from `master`).

## Build, Test, and Development Commands
- `pnpm run dev` starts the local dev server with Turbopack.
- `pnpm run build` creates a production bundle; `pnpm run start` runs it on the Next.js Node server. Use `pnpm run preview:cf` to build and run it locally in the Cloudflare Workers runtime with D1/R2 bindings.
- `pnpm run lint` runs the configured ESLint ruleset; fix warnings before opening a PR.
- `pnpm run deploy` (production) and `pnpm run deploy:preview` build and ship via OpenNext + Cloudflare. Run `pnpm run cf:typegen` after editing bindings or vars in `wrangler.jsonc`; it regenerates `cloudflare-env.d.ts`.
- Database helpers: `pnpm run db:generate` creates a migration from `lib/db/schema.ts`; `pnpm run db:migrate:local`, `db:migrate:preview` and `db:migrate:prod` apply migrations; use the paired `db:shell:*` commands for ad-hoc queries.

## Coding Style & Naming Conventions
- TypeScript is required; prefer explicit types on exported functions. Use 2-space indentation and keep imports sorted logically (React/Next, third-party, local).
- Components and server actions follow PascalCase filenames; route handlers stay lowercase (`route.ts`, `layout.tsx`). Tailwind classes drive styling—share design tokens via `app/styles` when possible.
- Run ESLint before committing; add targeted `// eslint-disable-next-line` comments only when justified.

## Testing Guidelines
- Vitest tests (`__tests__/`, `pnpm run test:run`) include sample rendering, the Nx dependency-boundary contract and the E2E resource fixture lifecycle; use Japanese behavior names for new tests. Keep boundary checks covering aliases, relative imports and project cycles.
- Always run `pnpm run lint` and `pnpm run build` before pushing. For database changes, exercise migrations locally via `db:migrate:local` and seed data through the D1 shell commands. Playwright E2E tests live in `e2e/` (`pnpm run test:e2e`); see the README for Clerk test-instance requirements.

## Commit & Pull Request Guidelines
- History shows short imperative commits (`fix: upload image`, `add rss feed...`). Follow `type: summary (context)` with optional issue reference `(vibe-kanban XXXXX)`.
- Squash local work into logical commits. PRs should describe the change, list manual checks (lint/build/migrations), attach screenshots for UI updates, and link tracking tickets. Request review before merging to `master`.

## Security & Configuration Tips
- Secrets live in Cloudflare env vars; never commit credentials. Add non-secret keys to `wrangler.jsonc` `vars` and secrets via `wrangler secret put`, run `pnpm run cf:typegen` to regenerate `cloudflare-env.d.ts`, and verify `wrangler.jsonc` stays in sync with deployed bindings.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
