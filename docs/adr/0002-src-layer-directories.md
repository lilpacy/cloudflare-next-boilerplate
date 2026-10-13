# ADR-0002: One directory per layer under `src/`

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** lilpacy
- **Supersedes:** the directory placement in [ADR-0001](0001-layered-app-structure.md) ("Place the non-UI layers inside `app/` as private folders"). The layers, the dependency rule and everything else in ADR-0001 stay in force.

This record explains *why* the layers moved. It is history; read [ARCHITECTURE.md](../../ARCHITECTURE.md) for the current rules.

## Context

ADR-0001 placed Application, Domain and Infrastructure inside the App Router directory as
`app/_application`, `app/_domain` and `app/_infrastructure`. After the migration finished, the
tree mixed two granularities:

| Problem | Where |
|---|---|
| The UI layer had no directory of its own: it was "`app/` minus three private folders". The lint rule for UI had to be written as `files: ["app/**"]` plus an `ignores` list of the other layers | `eslint.config.mjs` (UI block) |
| UI code lived in two places: `app/` and the repository-root `middleware.ts` | repository root |
| `app/` meant both "the Next.js routing root" and "all application code", so the non-UI layers needed the `_` private-folder prefix only to stay out of routing | `app/_*` |
| Three layers sat as siblings of route folders (`todos/`, `profile/`) and of UI folders (`components/`, `_lib/`), so the four-layer structure was not visible from a directory listing | `app/` |

ADR-0001 rejected "`src/{domain,application,infrastructure}/` outside `app/`" because it left two
parallel trees (`app/` and `src/`). Moving `app/` itself into `src/` removes that objection: there
is again one tree for application code.

The Next.js 16.3.8 docs support this layout: `01-app/03-api-reference/03-file-conventions/src-folder.md`
("move the `app` Router folder ... to `src/app`", Proxy/Middleware "placed inside the `src` folder",
`@/*` paths updated to include `src/`) and `01-app/01-getting-started/02-project-structure.md`
("Store project files outside of `app`").

## Decision

Move application code under `src/`, one directory per layer:

```
src/
  domain/          Domain
  application/     Application
  infrastructure/  Infrastructure
  app/             UI (App Router: routes, components/, _lib/, styles/)
  middleware.ts    UI (location fixed by Next.js)
```

- `@/*` resolves to `./src/*`, so imports read `@/domain/...`, `@/application/...`, `@/infrastructure/...`, `@/app/...`.
- The non-UI layers drop the `_` prefix; they are outside the routing root.
- `middleware.ts` stays at the `src/` root. Next.js only loads it from the same level as `app`
  (`proxy.md`: "in the project root, or inside `src` if applicable, so that it is located at the same
  level as `pages` or `app`"); inside `src/app/` it would be silently ignored.
- Layer names keep Evans' full words (`infrastructure`, not `infra`), matching ARCHITECTURE.md.

## Alternatives considered

| Option | Pros | Cons | Outcome |
|---|---|---|---|
| **`src/{domain,application,infrastructure,app}`** | One directory per layer; lint rules select a layer by one glob; no `_` prefixes needed | One-time move of every app file and path reference | **Chosen** |
| Keep `app/_layer/` (ADR-0001) | No churn | The problems in Context remain | Rejected |
| `{domain,application,infrastructure}/` at the repository root next to `app/` | Same layer separation without `src/` | Application code mixed with config files, `e2e/`, `drizzle/`, `packages/` at the root | Rejected |
| Put `middleware.ts` inside `src/app/` so all UI code shares one directory | UI layer would be exactly one directory | Next.js does not load it there; the sign-in redirect would silently stop working | Rejected (not possible) |
| Keep `middleware.ts` logic in `src/app/_middleware.ts` and re-export it from `src/middleware.ts` | UI logic inside `src/app/` | `config.matcher` must stay statically analyzable in `middleware.ts`, so the file splits in two for a few dozen lines | Rejected |

## Consequences

Positive:

- Each layer's ESLint block selects it with a single glob (`src/domain/**`, `src/application/**`,
  `src/infrastructure/**`, `src/app/**`); the UI block no longer needs `ignores`.
- The four layers are visible as four sibling directories.
- Import paths name the layer directly (`@/application/todos` instead of `@/app/_application/todos`).

Negative / accepted trade-offs:

- `src/middleware.ts` is UI but outside `src/app/`. It is also still outside the UI lint block,
  as before the move, because it imports `@clerk/nextjs/server` (the documented exception in
  ARCHITECTURE.md).
- Every in-flight branch that touches `app/` needs a rebase with path changes.
- Paths that point outside the tree gained one level: the Tailwind `@source` for `packages/ui` in
  `src/app/styles/globals.scss`, and `drizzle.config.ts` now points at `src/infrastructure/schema.ts`.

## Verification

At the time of the move: `pnpm run lint`, `pnpm run test:run` (83 tests), `tsc --noEmit` and
`pnpm run build` passed. The build lists `ƒ Proxy (Middleware)`, so `src/middleware.ts` is detected.
The built CSS contains classes used only in `packages/ui` (`transition-shadow`, `shadow-md`), so the
`@source` path resolves. `pnpm run db:generate` reports "No schema changes". The Playwright suite
was not run (it needs a Clerk test instance).
