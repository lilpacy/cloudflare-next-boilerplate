# ADR-0004: Move the Next.js app into `apps/web/`, managed by Nx

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** lilpacy
- **Builds on:** [ADR-0002](0002-src-layer-directories.md) (one directory per layer under `src/`)
  and [ADR-0003](0003-database-package.md) (`packages/database`). Neither is superseded: the layers
  and their directory names are unchanged, only their common ancestor moves from the repository
  root to `apps/web/`.

This record explains *why* the app moved. It is history; read [ARCHITECTURE.md](../../ARCHITECTURE.md)
for the current rules.

## Context

Before this change the Next.js app (`src/`, `next.config.ts`, `wrangler.jsonc`,
`open-next.config.ts`, `public/`, `tsconfig.json`) lived at the repository root, as a sibling of
`packages/ui` and `packages/database`. Nx already treated the root `package.json` as a project
named `web` (tagged `type:app`) purely to run the dependency-boundary lint rule; `dev`/`build`
still called `next dev`/`next build` directly, so Nx did not manage the actual dev/build lifecycle.

This mixed two different things at the repository root: the one app's source and config, and the
workspace's shared tooling config (`pnpm-workspace.yaml`, `nx.json`, `eslint.config.mjs`,
`vitest.config.ts`, `playwright.config.ts`, `__tests__/`, `e2e/`). It also meant a second app,
Worker, or CLI package would have nowhere to go without repeating the same flattening problem
`packages/database` solved for the database.

## Decision

Move the app into `apps/web/`, keep `packages/ui` and `packages/database` where they are, and let
Nx run the app's `dev`/`build` targets by name:

```
apps/
  web/
    src/                 (unchanged: domain/, application/, infrastructure/, app/, middleware.ts)
    public/
    next.config.ts, next-env.d.ts, open-next.config.ts, wrangler.jsonc
    postcss.config.mjs, cloudflare-env.d.ts, tsconfig.json
    package.json         (app dependencies + dev/build/start/deploy/db/storage scripts, "nx" field)
packages/
  database/, ui/          (unchanged)
```

- `pnpm-workspace.yaml` adds `apps/*` alongside `packages/*`.
- The `"nx": { "name": "web", "tags": ["type:app"], "projectType": "application" }` field moves
  from the root `package.json` to `apps/web/package.json`; the Nx project is still named `web`, so
  `__tests__/module-boundaries.test.ts`'s graph assertions (`["database", "ui", "web"]`) and the
  `depConstraints` in `eslint.config.mjs` are unchanged.
- The root `package.json` keeps only workspace-wide scripts. `dev`/`build`/`start` now read
  `nx dev web` / `nx build web` / `nx start web` (Nx runs the matching script in
  `apps/web/package.json`, matching the user's request to let Nx manage the dev server and build).
  Deploy, database and storage scripts delegate with `pnpm --filter web run <script>` so they run
  with `apps/web` as the working directory, which Wrangler and OpenNext require.
- `tsconfig.base.json` drops the `@/*` path alias (it is app-specific now); `apps/web/tsconfig.json`
  declares it directly, resolved relative to `apps/web/`. The root `tsconfig.json` becomes a small
  config for `__tests__/`, `e2e/` and the root tooling config files only.
- `wrangler.jsonc`'s `migrations_dir` becomes `../../packages/database/migrations` (relative to its
  new location); the CI workflows write the secret-backed config to `apps/web/wrangler.jsonc` and
  run `opennextjs-cloudflare build`/`deploy` with `working-directory: apps/web`.
- The per-layer ESLint `files` globs and the dependency-boundary test's virtual file paths gain the
  `apps/web/` prefix (e.g. `src/domain/**` → `apps/web/src/domain/**`); the layer rules themselves,
  and the `type:app`/`type:ui`/`type:database` `depConstraints`, are unchanged.

## Alternatives considered

| Option | Pros | Cons | Outcome |
|---|---|---|---|
| **`apps/web/` with its own `package.json`, Nx runs `dev`/`build` by project name** | Workspace root becomes management-only; matches `packages/*`; ready for a second app/Worker/CLI without repeating this move | One-time move of every app file and path reference across config, lint, tests and CI | **Chosen** |
| Keep the Next.js app at the repository root, add `@nx/next` plugin for target inference | No file moves | Root keeps mixing app source with workspace config; does not address the stated goal of an `apps/` directory | Rejected |
| Move the app but keep the root `package.json` as its `package.json` (no `apps/web/package.json`) | Fewer files | Nx has no way to name the app project independently of the workspace root; next app/package added later hits the same flattening problem this ADR fixes | Rejected |

## Consequences

Positive:

- `apps/*` and `packages/*` read the same way: one directory per deployable/publishable unit, each
  with its own `package.json`.
- `nx dev web` / `nx build web` match the user's request that Nx manage the dev server and the
  build, instead of the root `package.json` calling `next` directly.
- A second app (cron Worker, CLI, another Next.js app) has a home (`apps/<name>/`) without moving
  `apps/web/` again.

Negative / accepted trade-offs:

- Every path that pointed at the app's `src/`, `wrangler.jsonc`, `open-next.config.ts` or
  `tsconfig.json` gained an `apps/web/` prefix: ESLint globs, the dependency-boundary test, CI
  workflows, `e2e/fixtures/CloudflareBindings.ts`, `AGENTS.md`, `README.md` and `ARCHITECTURE.md`.
- `wrangler`/OpenNext commands must now run with `apps/web` as the working directory; root-level
  `db:*`/`storage:*`/`deploy*` scripts are one `pnpm --filter web run` hop instead of calling the
  CLI directly.
- `type:ui`/`type:database` still cannot depend on `type:app` (`packages/*` → `apps/*` imports stay
  forbidden); `type:app` may depend on both (`apps/*` → `packages/*` imports stay allowed). This was
  already true before the move and is unchanged by it.

## Amendments

| Plan item | Amendment | Reason |
|---|---|---|
| Context: `playwright.config.ts` and `e2e/` counted as workspace tooling at the root | Moved to `apps/web/playwright.config.ts` and `apps/web/e2e/`; root `test:e2e` delegates with `pnpm --filter web run test:e2e` | Every spec, page object and fixture targets the `web` app only. At the root the suite had to address `apps/web/wrangler.jsonc` and `apps/web/.wrangler/state` by path, and running Wrangler from the root already broke once (#23). With `apps/web` as the working directory, Wrangler, the local D1 state and `next dev` resolve without prefixes. A separate `apps/web-e2e` Nx project was not chosen: its working directory would still not be `apps/web`, and CI does not run E2E, so `nx affected` gains nothing yet |

## Verification

At the time of the move: `pnpm install`, `pnpm run lint`, `pnpm run type-check`, `pnpm run test:run`
and `pnpm run build` (via `nx build web`) were run against the new layout; see the pull request for
results.
