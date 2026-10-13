# ADR-0003: Table definitions and migrations in `packages/database`

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** lilpacy
- **Amends:** [ADR-0001](0001-layered-app-structure.md) ("Nx library projects ... Deferred until a second app exists") and the ARCHITECTURE.md non-goal "Layers are not separate Nx projects or packages", for the database schema only. The four layers and the dependency rule are unchanged.

This record explains *why* the schema left `src/infrastructure/`. It is history; read
[ARCHITECTURE.md](../../ARCHITECTURE.md) for the current rules.

## Context

After ADR-0002 the database was spread over three places that had to stay in sync by hand:

| Piece | Location |
|---|---|
| Table definitions | `src/infrastructure/schema.ts` (one file, every table) |
| drizzle-kit config | `drizzle.config.ts` at the repository root |
| Migrations and snapshots | `drizzle/` at the repository root |

ADR-0001 deferred packaging until a second app shares the database. This repository is a
boilerplate: a fork is expected to grow tables with relations quickly, and the first thing a
fork adds next to the Next.js app is usually another Worker on the same D1 (cron, queue consumer,
seed script). Waiting for that moment means every fork does this move itself, after the schema
has grown. The move is cheapest now, with two tables.

Two known gaps also had no home: `getDb()` in `src/infrastructure/db.ts` is bound to OpenNext
(`getCloudflareContext()`) and React (`cache()`), so nothing outside the Next.js app could open the
database; and ADR-0001's amendments record that schema/migration drift is not checked anywhere.

## Decision

Create the private workspace package `@cf-next/database` (`packages/database/`, Nx project
`database`, tag `type:database`):

```
packages/database/
  src/
    modules/<name>/schema.ts   one module per feature; tables only
    schema.ts                  registers every module (drizzle-kit and createDb read this file)
    db.ts                      createDb(d1: D1Database)
    index.ts
  migrations/                  drizzle-kit output; wrangler.jsonc migrations_dir points here
  test/migrations.test.ts      applies the migrations to an in-memory SQLite and compares with schema
  drizzle.config.ts
```

- The package depends on `drizzle-orm` only. The Nx constraint for `type:database` allows no
  project dependencies and bans Clerk, OpenNext, AWS, Next.js, React and `server-only`.
- `createDb(d1)` takes the D1 binding as a parameter. The app's `src/infrastructure/db.ts` keeps
  the OpenNext lookup and the per-request `cache()`; a cron Worker calls `createDb(env.DB)`.
- Queries (`src/infrastructure/todos.ts`, `users.ts`) stay in the app. They return Domain DTOs, so
  moving them would make the package depend on the app.
- Only `src/infrastructure/` may import `@cf-next/database`. Domain, Application and UI ban it
  with the same `no-restricted-imports` groups that ban `drizzle-orm`; `packages/ui` is blocked by
  its Nx tag constraint.
- `pnpm run db:generate` delegates to the package (`drizzle-kit` resolves paths from its cwd).
  `wrangler d1 migrations apply` keeps running from the root through `migrations_dir`.
- The deploy workflows set `migrations_dir` on every D1 binding from the repository, so the
  wrangler config stored in the GitHub secret does not need to carry the path.

## Alternatives considered

| Option | Pros | Cons | Outcome |
|---|---|---|---|
| **`packages/database` with schema, migrations, `createDb`** | One place for the database; usable from any Worker; drift test has a natural home | New Nx project; Infrastructure's table definitions live outside `src/infrastructure/` | **Chosen** |
| Keep everything in `src/infrastructure/`, split `schema.ts` per table | Smallest change | A second Worker still cannot open the database; the three locations in Context stay | Rejected |
| Move queries and `getDb()` into the package too | App's Infrastructure shrinks to Clerk and R2 | Package would import Domain DTOs (`app → database → app` cycle) and OpenNext | Rejected |
| Move only `drizzle/` migrations under `packages/` | Fewer root directories | A directory that nothing imports is not a package; the schema it belongs to stays elsewhere | Rejected |

## Consequences

Positive:

- Adding a table means one new `modules/<name>/schema.ts` and one line in `schema.ts`.
- `packages/database/test/migrations.test.ts` fails when `schema.ts` changes without
  `pnpm run db:generate` (or when a migration is edited by hand). Nothing checked this before.
- Any Worker in the monorepo can open the same database with `createDb(env.DB)`.

Negative / accepted trade-offs:

- The Infrastructure layer now spans `src/infrastructure/` (queries, bindings, Clerk, R2) and
  `packages/database/` (table definitions). The package is treated like an SDK that only
  Infrastructure may import.
- The package carries dev dependencies of its own (`drizzle-kit`, `better-sqlite3`,
  `@cloudflare/workers-types`, `vitest`) because the Nx `banTransitiveDependencies` rule requires
  every import to be declared in the nearest `package.json`.
- The migration test compares table names, column names, SQL types, `NOT NULL` and primary keys.
  Defaults, indexes and foreign keys are not compared yet.

## Verification

`pnpm run lint`, `pnpm run test:run` (94 tests), `pnpm run type-check` (root, `@cf-next/ui`,
`@cf-next/database`) and `pnpm run build` passed. `pnpm run db:generate` reports "No schema
changes". Adding a column to `users` without regenerating made the migration test fail, so the
drift check is live.
