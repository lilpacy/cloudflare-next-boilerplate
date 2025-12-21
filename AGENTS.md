# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router; page-level logic lives in route folders (e.g., `app/blog`, `app/admin`) with shared UI in `app/components` and utilities in `app/actions`.
- Domain helpers live under `lib/` (`lib/db` for Drizzle clients, `lib/schemas` for Zod contracts, `lib/utils` for shared helpers). Update these when adjusting data flows.
- Database migrations sit in `drizzle/`; keep SQL files in sync with generated metadata. Static assets belong in `public/`, and deployment wiring is captured by `open-next.config.ts` and `wrangler.jsonc`.

## Build, Test, and Development Commands
- `npm run dev` starts the local dev server with Turbopack.
- `npm run build` creates a production bundle; follow with `npm run start` to simulate the Cloudflare runtime locally.
- `npm run lint` runs the configured ESLint ruleset; fix warnings before opening a PR.
- `npm run deploy` and `npm run preview` build and ship via OpenNext + Cloudflare. Use `npm run cf-typegen` after editing `cloudflare-env.d.ts`.
- Database helpers: `npm run db:migrate:local` and `npm run db:migrate:remote` apply the current Drizzle migration; use the paired `db:shell:*` commands for ad-hoc queries.

## Coding Style & Naming Conventions
- TypeScript is required; prefer explicit types on exported functions. Use 2-space indentation and keep imports sorted logically (React/Next, third-party, local).
- Components and server actions follow PascalCase filenames; route handlers stay lowercase (`route.ts`, `layout.tsx`). Tailwind classes drive styling—share design tokens via `app/styles` when possible.
- Run ESLint before committing; add targeted `// eslint-disable-next-line` comments only when justified.

## Testing Guidelines
- Automated tests are not yet in place; when adding them, colocate files as `*.test.ts` alongside the code and target critical rendering paths and Drizzle queries.
- Always run `npm run lint` and `npm run build` before pushing. For database changes, exercise migrations locally via `db:migrate:local` and seed data through the D1 shell commands.

## Commit & Pull Request Guidelines
- History shows short imperative commits (`fix: upload image`, `add rss feed...`). Follow `type: summary (context)` with optional issue reference `(vibe-kanban XXXXX)`.
- Squash local work into logical commits. PRs should describe the change, list manual checks (lint/build/migrations), attach screenshots for UI updates, and link tracking tickets. Request review before merging to main.

## Security & Configuration Tips
- Secrets live in Cloudflare env vars; never commit credentials. Update `cloudflare-env.d.ts` and regenerate types when adding keys, and verify `wrangler.jsonc` stays in sync with deployed bindings.
