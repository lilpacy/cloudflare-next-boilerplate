# Cloudflare Next.js + D1 + R2 Boilerplate

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/lilpacy/cloudflare-next-boilerplate)

A production-ready boilerplate for building full-stack applications with Next.js 16 on Cloudflare Workers, featuring D1 (SQLite) database, R2 object storage, and Clerk authentication.

## Features

- **Next.js 16** - Latest React framework with App Router and Server Components
- **Cloudflare Workers** - Deploy globally on the edge with Workers
- **D1 Database** - Serverless SQLite database at the edge
- **R2 Storage** - Object storage compatible with S3 API
- **Clerk Auth** - Drop-in authentication and user management
- **Drizzle ORM** - Type-safe database queries and migrations
- **TypeScript** - Full type safety across the stack
- **Tailwind CSS** - Utility-first CSS framework
- **Todo App Example** - Full CRUD implementation as reference

## Prerequisites

- Node.js 22.12+ and pnpm 10.13.1 (required by Wrangler and the build/test tooling)
- Cloudflare account (free tier works)
- Clerk account (free tier works)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/lilpacy/cloudflare-next-boilerplate.git
cd cloudflare-next-boilerplate
pnpm install
```

### 2. Set Up Clerk Authentication

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys
4. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

5. Update `.env.local` with your Clerk keys

### 3. Create Cloudflare Resources

#### D1 Databases

```bash
# Production database
pnpm run db:create

# Preview/staging database
pnpm run db:create:preview
```

Copy the database IDs from the output and update `apps/web/wrangler.jsonc`:
- Replace `YOUR_D1_DATABASE_ID_HERE` with production database ID
- Replace `YOUR_PREVIEW_D1_DATABASE_ID_HERE` with preview database ID

#### R2 Buckets

```bash
# Create all required buckets
pnpm run storage:create               # Main storage
pnpm run storage:create:cache         # Next.js cache
pnpm run storage:create:preview       # Preview storage
pnpm run storage:create:cache:preview # Preview Next.js cache
```

### 4. Update Configuration

Edit `apps/web/wrangler.jsonc` and replace all placeholder values:
- `database_id`: Your D1 database IDs
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `NEXT_PUBLIC_BASE_URL`: Your production domain (or localhost for dev)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: (Optional) Your GA4 measurement ID
- `ADMIN_EMAILS`: Comma-separated emails allowed to access `/admin`

The `env.preview` section has its own D1 database ID and Clerk publishable key.
Its `ADMIN_EMAILS` is set to the E2E admin test account.

### 5. Run Database Migrations

```bash
# For local development
pnpm run db:migrate:local

# For production (after first deploy)
pnpm run db:migrate:prod

# For the preview environment
pnpm run db:migrate:preview
```

### 6. Start Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
├── apps/
│   └── web/                # Next.js app (Nx project "web")
│       ├── src/            # Application code, one directory per layer (see ARCHITECTURE.md)
│       │   ├── app/        # UI layer: Next.js App Router
│       │   │   ├── admin/         # Admin dashboard
│       │   │   ├── api/images/    # R2 image delivery route
│       │   │   ├── profile/       # Profile page with image upload
│       │   │   ├── sign-in/, sign-up/ # Clerk authentication pages
│       │   │   ├── todos/         # Todo app example (page, actions.ts, components/)
│       │   │   ├── components/    # React components shared across routes
│       │   │   ├── styles/        # Global styles
│       │   │   └── _lib/          # UI-side helpers (page error mapping, ActionResult)
│       │   ├── application/       # Use cases: authn/authz, orchestration (server-only)
│       │   ├── domain/            # DTO types, zod schemas, constants, error classes
│       │   ├── infrastructure/    # D1/drizzle, R2, Clerk SDK access (server-only)
│       │   └── middleware.ts      # UI layer: Clerk sign-in redirect (authorization lives in apps/web/src/application)
│       ├── public/         # Static assets
│       ├── e2e/            # Playwright specs, page objects and fixtures (playwright.config.ts sits next to it)
│       ├── open-next.config.ts   # OpenNext Cloudflare adapter config
│       ├── wrangler.jsonc        # Cloudflare Workers config
│       └── package.json          # App dependencies and scripts
├── packages/
│   ├── database/          # @cf-next/database: table definitions (src/modules/*), createDb(d1), migrations/
│   └── ui/                # @cf-next/ui: shared presentation-only components
├── __tests__/            # Cross-cutting Vitest tests (unit tests sit next to their module as *.test.ts)
├── .github/workflows/     # PR CI and deploy workflows
├── nx.json, pnpm-workspace.yaml  # Workspace/Nx configuration
└── package.json          # Workspace-level scripts (`nx dev web`, `nx build web`, lint, test)
```

## Available Scripts

### Development
- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server locally
- `pnpm run lint` - Run ESLint
- `pnpm run type-check` - Run TypeScript type checking (app, `@cf-next/ui`, `@cf-next/database`)
- `pnpm run graph` - Open the Nx project graph
- `pnpm run cf:typegen` - Regenerate `cloudflare-env.d.ts` from `apps/web/wrangler.jsonc`

### Testing
- `pnpm run test` - Run Vitest in watch mode
- `pnpm run test:run` - Run Vitest once
- `pnpm run test:ui` - Open the Vitest UI
- `pnpm run test:coverage` - Run Vitest with coverage
- `pnpm run test:e2e` - Run Playwright E2E tests
- `pnpm --filter @cf-next/ui run storybook` - Start Storybook for `packages/ui` on port 6006
- `pnpm --filter @cf-next/ui run storybook:build` - Build the static Storybook into `packages/ui/storybook-static` (Nx-cached: `nx run ui:storybook:build`)
- `pnpm --filter @cf-next/ui run storybook:test` - Render every story in headless Chromium and fail on a11y violations (needs `pnpm --filter @cf-next/ui exec playwright install chromium` once)

### Database (D1)
- `pnpm run db:create` - Create production database
- `pnpm run db:create:preview` - Create preview database
- `pnpm run db:generate` - Generate a migration from `packages/database/src/schema.ts` into `packages/database/migrations/`
- `pnpm run db:migrate:local` - Run migrations locally
- `pnpm run db:migrate:prod` - Run migrations on production
- `pnpm run db:migrate:preview` - Run migrations on preview
- `pnpm run db:shell:local "<SQL>"` - Execute SQL on the local database
- `pnpm run db:shell:prod "<SQL>"` - Execute SQL on the production database
- `pnpm run db:shell:preview "<SQL>"` - Execute SQL on the preview database
- `pnpm run db:export:local` / `db:export:prod` / `db:export:preview` - Export a database to `database-*.sql`

### Storage (R2)
- `pnpm run storage:create` - Create main R2 bucket
- `pnpm run storage:create:cache` - Create cache bucket
- `pnpm run storage:create:preview` - Create preview bucket
- `pnpm run storage:create:cache:preview` - Create preview cache bucket

### Deployment
- `pnpm run deploy` - Build and deploy to production (alias of `deploy:prod`)
- `pnpm run deploy:preview` - Build and deploy the `preview` environment
- `pnpm run preview:cf` - Build and preview locally in the Cloudflare Workers runtime

### Next.js 16 compatibility

Next.js is held to the 16.3 patch series (`~16.3.8`): 16.4 currently causes
Workers requests to fail when OpenNext loads `preview-props.json`
([upstream issue #1355](https://github.com/opennextjs/opennextjs-cloudflare/issues/1355)).
Revisit the minor-version limit after the adapter fixes this and local Workers
checks pass.

Next.js 16 uses Turbopack for development and production builds. ESLint runs
separately via `pnpm run lint`; `next build` no longer runs it.

Keep `apps/web/src/middleware.ts` for the Clerk sign-in redirect (authorization lives in
`apps/web/src/application`, see `ARCHITECTURE.md`): it uses the Edge runtime. The Node.js runtime used by `proxy.ts` is not supported by
the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare). Revisit
this when the adapter supports Node.js middleware/proxy.

Builds require a valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` or
the build environment. Set `CLERK_SECRET_KEY` in `.dev.vars` for local Workers
preview and in `.env.local` for `next dev`. Use `pnpm run preview:cf` to verify
D1/R2 bindings in Workers; `pnpm run start` runs the Next.js Node server.

## Workspace packages and dependency boundaries

The Next.js application lives in `apps/web` (Nx project `web`). Two private workspace
packages sit in `packages/`; both export TypeScript source, and Next.js processes
them through `transpilePackages`. Neither has an independent build/watch process.

- `@cf-next/ui` (`packages/ui`): presentation-only React components. The homepage
  uses its `Card`, and the Todo and profile forms use its `PrimaryButton`,
  `TextInput` and `Textarea`. Each component has a `*.stories.tsx` next to it;
  `packages/ui/.storybook/` holds the Storybook config (`@storybook/react-vite`,
  docs, a11y and Vitest addons) and a standalone Tailwind entry (`preview.css`),
  so stories do not load `apps/web`'s SCSS. `packages/ui/vitest.config.ts` runs
  the stories in Vitest browser mode, separate from the root happy-dom config.
- `@cf-next/database` (`packages/database`): drizzle table definitions
  (`packages/database/src/modules/<name>/schema.ts`, registered in `packages/database/src/schema.ts`), `createDb(d1)`
  and the `migrations/` directory that `wrangler d1 migrations apply` reads. It
  depends on `drizzle-orm` only, so a cron Worker or a script can open the same
  D1 with `createDb(env.DB)` without Next.js. Only `apps/web/src/infrastructure/` may
  import it. `packages/database/test/migrations.test.ts` applies the migrations
  to an in-memory SQLite and fails when they drift from the schema.

- `pnpm dev`: start the application; edits in `packages/ui/src` use Fast Refresh.
- `pnpm graph`: open the Nx project graph (`web` → `ui`, `web` → `database`).
- `pnpm exec nx graph --file=.nx/project-graph.json`: export the graph as JSON.
- `pnpm type-check`: check the app and both packages.
- `pnpm lint`: generate a fresh Nx graph, then run ESLint and boundary checks.
- `pnpm test:run`: run the existing tests and the dependency-boundary contract test.

The `type:ui` project cannot import the app or `@cf-next/database`, even through
`@/` aliases, relative paths, re-exports, dynamic imports, or require calls. It
also cannot import the app's Clerk, Drizzle, AWS storage SDK or OpenNext binding
packages. The `type:database` project cannot import any other project, Next.js,
React or the SDKs. Cross-project cycles are rejected. Existing aliases within the app remain allowed; file-level
cycles within one project are not checked by this project-boundary rule
([follow-up LIL-583](https://linear.app/lilpacy/issue/LIL-583)).

Tailwind explicitly scans `packages/ui/src` through `@source` in the existing
SCSS entry. Sass and the existing styling remain unchanged.

Boundary enforcement runs in `pnpm lint`, the existing Husky pre-commit hook,
the `CI` workflow (`.github/workflows/ci.yml`, on every pull request and
`master` push: `pnpm lint`, `pnpm type-check`, `pnpm test:run`, then
`nx build web` with a placeholder Clerk publishable key; a parallel `storybook`
job builds and tests `packages/ui` stories and uploads `storybook-static`) and the
preview deploy workflow on `master` pushes. The `checks` job is a required status
check on `master` (repository ruleset "master: require CI checks"), so a PR cannot
be merged and `master` cannot be pushed to until it passes. Plain `eslint`/IDE lint needs
an existing Nx graph; the rule can skip if that cache is missing, so use
`pnpm lint` as the required gate. `type-check` results are cached by Nx
(`nx.json` `targetDefaults`); the cache key covers each project, its workspace
dependencies and `tsconfig.base.json`. Nx Cloud is not configured.

## E2E Testing

```bash
# Against a local dev server (started automatically by Playwright)
pnpm run test:e2e

# Run independent scenarios in parallel (default: one worker)
pnpm run test:e2e --workers=3

# Against the deployed preview worker
E2E_ENV=preview E2E_PREVIEW_URL=https://my-app-preview.<account>.workers.dev pnpm run test:e2e
```

E2E tests require a Clerk **test instance** (`CLERK_SECRET_KEY` starting with
`sk_test_` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) in `.env` or `.env.local`.
Each authenticated scenario creates a unique test user and deletes it afterward.
The fixed admin account is retained for the read-only dashboard scenario.

Page Objects live in `apps/web/e2e/pages`: `HomePage`, `TodosPage`, `EditTodoPage`,
`ProfilePage`, and `AdminPage` own their page's locators and interactions;
`Navigation` owns the shared desktop/mobile menu. Specs keep scenario data,
assertions, and fixture selection. Clerk sign-in/out stays in authentication
fixtures/specs; global setup initializes Clerk, applies migrations, and saves
only the fixed admin storage state.

```ts
const todos = new TodosPage(page);
await todos.open();
await todos.create(todoTitle, todoDescription);
await expect(todos.title(todoTitle)).toBeVisible();
await expect(todos.titleInput).toHaveValue("");
```

Expose native Playwright locators for web-first assertions; add page-specific
actions to the relevant object rather than DOM selectors to specs. Each Todo
scenario uses its own user and at most one Todo, so its edit/toggle/delete
actions require a single matching Todo. Run `pnpm run test:e2e --list` to check test discovery
without starting the server or executing setup.

Test resources live in `apps/web/e2e/fixtures`. `ResourceFixture.run` executes
`create → precheck → use → cleanup` once per instance. Cleanup runs even when
creation fails partway; simultaneous operation and cleanup errors are preserved
as an `AggregateError`. Playwright fixtures create a new `UserResource` per
case; `TodoResource` and `ProfileImageResource` seed only the cases that need
existing data. No scenario depends on another scenario's mutations or order.

`UserResource` owns its newly created Clerk user, D1 rows with that user ID, and
R2 keys under `profiles/<userId>/`, including uploads without a profile DB row.
Cleanup attempts D1, R2, and Clerk independently and reports failures.
Global setup no longer deletes all rows in `todos` or `users`.

Local fixtures use the worktree's `apps/web/.wrangler/state/v3` (the same local state `next dev` writes to). Preview fixtures select
only the preview DB/R2 bindings through Wrangler's remote binding proxy, so
preview execution also requires Wrangler/Cloudflare authentication. The proxy
uses a temporary binding-only config; app variables, secrets, and the committed
Wrangler config are not copied or modified.

> Use a dedicated E2E preview environment: setup still applies schema migrations
> and ensures the fixed admin account. Fixture cleanup deletes only resources
> owned by each test. Avoid concurrently provisioning the same preview schema
> from multiple CI jobs; initialize it once before running shards.

## Deployment

### First-Time Deployment

1. Ensure all Cloudflare resources are created (D1, R2)
2. Update `apps/web/wrangler.jsonc` with actual IDs and values
3. Set the Clerk secret key as a Worker secret (required for authentication in deployed environments):

```bash
pnpm dlx wrangler secret put CLERK_SECRET_KEY
pnpm dlx wrangler secret put CLERK_SECRET_KEY --env preview
```

4. Run migrations locally first: `pnpm run db:migrate:local`
5. Run remote migrations: `pnpm run db:migrate:prod`
6. Deploy: `pnpm run deploy`

### Subsequent Deployments

```bash
pnpm run db:migrate:prod
pnpm run deploy
```

### Manual Production Deployment (GitHub Actions)

Open **Actions → Deploy production → Run workflow**, select **master**, then run
it. `.github/workflows/deploy-production.yml` accepts only manual dispatches on
`master`; other branches skip the deploy job. It runs lint, builds the OpenNext
Worker, applies pending production D1 migrations, then deploys to `my-app`.
A build or migration failure stops deployment. Production runs are serialized
without cancelling a running deployment. Pushing or merging to `master` still
only deploys preview automatically.

Set `CLOUDFLARE_WRANGLER_CONFIG` to the complete production Wrangler configuration
as valid JSON, with actual root D1/R2 bindings and root `vars` (`ENV_NAME` must be
`production`). The workflow exports root `vars` to the build and masks config
strings in logs. It shares `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` with
the preview workflow; the token must also cover production resources. Keep
`CLERK_SECRET_KEY` on the production Worker. Update this config secret whenever
production bindings or build variables change.

### Automatic Preview Deployment

Every push to `master` (including a merged PR) runs `.github/workflows/deploy-preview.yml`.
GitHub Actions installs the frozen lockfile, runs lint, builds the OpenNext Worker
with `--env preview`, applies pending preview D1 migrations with
`pnpm run db:migrate:preview`, then deploys with `--env preview`. It uses Node
22.16.0. A build or migration failure stops deployment. Preview deploys are
serialized without cancelling a running deployment. Check **Actions → Deploy
preview** for the result. Production deployment and migrations run only through the manual workflow below
or the commands above.

Configure these repository **Actions secrets** before enabling the workflow:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token scoped to the preview account with Workers Scripts Write, Workers R2 Storage Write, D1 Write, and Account Settings Read permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID for preview |
| `CLOUDFLARE_PREVIEW_WRANGLER_CONFIG` | Complete Wrangler configuration as valid JSON (remove JSONC comments and trailing commas), including explicit `env.preview.name`, preview D1/R2 bindings and `env.preview.vars` |

The workflow replaces the template config with this private config and passes
`env.preview.vars` to the build, including `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
`NEXT_PUBLIC_BASE_URL`. Set `env.preview.name` to `my-app-preview`, its DB name to
`my-app-db-preview`, its R2 bucket names to `my-app-storage-preview` and
`my-app-cache-preview`, and its self-reference service to `my-app-preview`. Set
`env.preview.routes` to `[]` to avoid inheriting production custom routes. Set
`ENV_NAME` to `preview` and use a Clerk test-instance publishable key. CI checks
these targets and rejects shared production DB IDs or R2 bucket names.

Config string values are masked in job logs. Keep the matching Clerk test-instance
`CLERK_SECRET_KEY` as a secret on the preview Worker; do not include it in the
config or GitHub build environment. Existing Worker secrets are preserved by
deployment.

Commit generated SQL migrations under `packages/database/migrations/`; CI applies only migrations not
recorded in D1's migration history. Keep pre-deploy migrations compatible with the
currently running code (for example, add nullable columns). Remove or rename used
columns only in a later migration after deploying code that no longer depends on
them. A Worker rollback does not undo database migrations. For a database created
outside migrations, verify its schema and establish a baseline migration history
before enabling this workflow; do not blindly mark migrations as applied.

When changing preview bindings or variables, update
`CLOUDFLARE_PREVIEW_WRANGLER_CONFIG` as well. The workflow does not provision
resources or run E2E tests. See [Cloudflare's CI authentication guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

### Preview Environment

For manual preview deployment, set the preview `NEXT_PUBLIC_*` build variables
in the shell or `.env.local`, especially the Clerk test-instance publishable key
and preview base URL. `--env preview` selects Wrangler bindings; it does not load
`env.preview.vars` into Next.js build-time variables. CI exports these variables
automatically, while the manual command requires this setup.

```bash
pnpm run db:migrate:preview
pnpm run deploy:preview
```

## Environment Variables

See `.env.example` for all available environment variables. For manual production deploys, configure these under `vars` in `apps/web/wrangler.jsonc`. For automatic preview deployment, configure `env.preview.vars` in the `CLOUDFLARE_PREVIEW_WRANGLER_CONFIG` Actions secret.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **ORM**: Drizzle ORM
- **Auth**: Clerk
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety
- **Deployment**: OpenNext for Cloudflare

## Example: Todo App

This boilerplate includes a fully functional Todo app demonstrating:

- User authentication with Clerk
- CRUD operations with D1
- Server Actions for mutations
- Client/Server component patterns
- Type-safe database queries
- Form handling and validation

Visit `/todos` after signing in to see it in action.

## Customization

### Removing the Todo App

If you want to start fresh without the Todo example:

1. Delete `apps/web/src/app/todos/` directory
2. Delete `apps/web/src/application/todos.ts`, `apps/web/src/infrastructure/todos.ts` and `apps/web/src/domain/todo.ts`
3. Delete `packages/database/src/modules/todos/` and its line in `packages/database/src/schema.ts`
4. Create new migration: `pnpm run db:generate`
5. Update navigation in `apps/web/src/app/components/navigation.tsx`
6. Update the admin dashboard (`apps/web/src/app/admin/page.tsx`), which shows Todo stats
7. Remove or update Todo E2E specs, page objects and fixtures in `apps/web/e2e/`

### Adding New Features

1. Define tables in `packages/database/src/modules/<name>/schema.ts` and register the module in `packages/database/src/schema.ts`
2. Generate migration: `pnpm run db:generate`
3. Create validation schemas and DTO types in `apps/web/src/domain/`
4. Add queries in `apps/web/src/infrastructure/` and use cases in `apps/web/src/application/` (see `ARCHITECTURE.md`)
5. Build UI in `apps/web/src/app/` using the example patterns; reads call Application from Server Components, mutations go through Server Actions

## Troubleshooting

### Database Issues
- **"Table not found"**: Run `pnpm run db:migrate:local` or `pnpm run db:migrate:prod`
- **"Database binding not found"**: Check `apps/web/wrangler.jsonc` configuration

### Authentication Issues
- **"Clerk not configured"**: Verify `.env.local` has correct keys
- **"Unauthorized"**: Ensure you're signed in and have proper permissions

### Deployment Issues
- **Build fails**: Run `pnpm run type-check` to find TypeScript errors
- **Workers error**: Verify all IDs in `apps/web/wrangler.jsonc` are correct
- **Database migrations**: Ensure you ran `pnpm run db:migrate:prod` after deployment

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
