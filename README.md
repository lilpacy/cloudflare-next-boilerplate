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

Copy the database IDs from the output and update `wrangler.jsonc`:
- Replace `YOUR_D1_DATABASE_ID_HERE` with production database ID
- Replace `YOUR_PREVIEW_D1_DATABASE_ID_HERE` with preview database ID

#### R2 Buckets

```bash
# Create all required buckets
pnpm run storage:create        # Main storage
pnpm run storage:create:cache  # Next.js cache
pnpm run storage:create:preview # Preview storage
```

### 4. Update Configuration

Edit `wrangler.jsonc` and replace all placeholder values:
- `database_id`: Your D1 database IDs
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `NEXT_PUBLIC_BASE_URL`: Your production domain (or localhost for dev)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: (Optional) Your GA4 measurement ID

### 5. Run Database Migrations

```bash
# For local development
pnpm run db:migrate:local

# For production (after first deploy)
pnpm run db:migrate:prod
```

### 6. Start Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── admin/             # Admin dashboard
│   ├── todos/             # Todo app example
│   ├── components/        # React components
│   └── styles/            # Global styles
├── lib/                   # Shared utilities
│   ├── db/               # Database schema and client
│   ├── r2/               # R2 storage client
│   └── schemas/          # Zod validation schemas
├── drizzle/              # Database migrations
├── public/               # Static assets
├── wrangler.jsonc        # Cloudflare Workers config
└── package.json          # Dependencies and scripts
```

## Available Scripts

### Development
- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server locally
- `pnpm run lint` - Run ESLint
- `pnpm run type-check` - Run TypeScript type checking

### Database (D1)
- `pnpm run db:create` - Create production database
- `pnpm run db:create:preview` - Create preview database
- `pnpm run db:migrate:local` - Run migrations locally
- `pnpm run db:migrate:prod` - Run migrations on production
- `pnpm run db:shell:local` - Open local database shell
- `pnpm run db:shell:prod` - Open remote database shell

### Storage (R2)
- `pnpm run storage:create` - Create main R2 bucket
- `pnpm run storage:create:cache` - Create cache bucket
- `pnpm run storage:create:preview` - Create preview bucket

### Deployment
- `pnpm run deploy` - Build and deploy to Cloudflare
- `pnpm run preview:cf` - Build and preview locally in the Cloudflare Workers runtime

### Next.js 16 compatibility

Next.js is held to the 16.3 patch series (`~16.3.8`): 16.4 currently causes
Workers requests to fail when OpenNext loads `preview-props.json`
([upstream issue #1355](https://github.com/opennextjs/opennextjs-cloudflare/issues/1355)).
Revisit the minor-version limit after the adapter fixes this and local Workers
checks pass.

Next.js 16 uses Turbopack for development and production builds. ESLint runs
separately via `pnpm run lint`; `next build` no longer runs it.

Keep `middleware.ts` for Clerk authentication and admin authorization: it uses
the Edge runtime. The Node.js runtime used by `proxy.ts` is not supported by
the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare). Revisit
this when the adapter supports Node.js middleware/proxy.

Builds require a valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` or
the build environment. Set `CLERK_SECRET_KEY` in `.dev.vars` for local Workers
preview and in `.env.local` for `next dev`. Use `pnpm run preview:cf` to verify
D1/R2 bindings in Workers; `pnpm run start` runs the Next.js Node server.

## Workspace UI and dependency boundaries

The Next.js application stays at the repository root. `packages/ui` is the
private `@cf-next/ui` React package; the homepage uses its `Card` component.
The package exports TypeScript source, and Next.js processes it through
`transpilePackages`. It has no independent build/watch process.

- `pnpm dev`: start the application; edits in `packages/ui/src` use Fast Refresh.
- `pnpm graph`: open the Nx project graph (`web` → `ui`).
- `pnpm exec nx graph --file=.nx/project-graph.json`: export the graph as JSON.
- `pnpm type-check`: check the app and the standalone UI package.
- `pnpm lint`: generate a fresh Nx graph, then run ESLint and boundary checks.
- `pnpm test:run`: run the existing tests and the dependency-boundary contract test.

The `type:ui` project cannot import the app, even through `@/` aliases, relative
paths, re-exports, dynamic imports, or require calls. It also cannot import the
app's Clerk, Drizzle, AWS storage SDK or OpenNext binding packages. Cross-project
cycles are rejected. Existing aliases within the app remain allowed; file-level
cycles within one project are not checked by this project-boundary rule
([follow-up LIL-583](https://linear.app/lilpacy/issue/LIL-583)).

Tailwind explicitly scans `packages/ui/src` through `@source` in the existing
SCSS entry. Sass and the existing styling remain unchanged.

Boundary enforcement runs in `pnpm lint` and the existing Husky pre-commit hook;
this repository has no GitHub CI workflow. A future CI job should run
`pnpm lint`, `pnpm type-check` and `pnpm test:run`. Plain `eslint`/IDE lint needs
an existing Nx graph; the rule can skip if that cache is missing, so use
`pnpm lint` as the required gate. Nx Cloud is not configured.

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

Page Objects live in `e2e/pages`: `HomePage`, `TodosPage`, `EditTodoPage`,
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

Test resources live in `e2e/fixtures`. `ResourceFixture.run` executes
`create → precheck → use → cleanup` once per instance. Cleanup runs even when
creation fails partway; simultaneous operation and cleanup errors are preserved
as an `AggregateError`. Playwright fixtures create a new `UserResource` per
case; `TodoResource` and `ProfileImageResource` seed only the cases that need
existing data. No scenario depends on another scenario's mutations or order.

`UserResource` owns its newly created Clerk user, D1 rows with that user ID, and
R2 keys under `profiles/<userId>/`, including uploads without a profile DB row.
Cleanup attempts D1, R2, and Clerk independently and reports failures.
Global setup no longer deletes all rows in `todos` or `users`.

Local fixtures use the worktree's `.wrangler/state/v3`. Preview fixtures select
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
2. Update `wrangler.jsonc` with actual IDs and values
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

### Automatic Production Deployment

Every push to `master` (including a merged PR) runs `.github/workflows/deploy.yml`.
GitHub Actions installs the frozen lockfile, runs lint, builds the OpenNext Worker,
applies pending production D1 migrations with `pnpm run db:migrate:prod`, then
deploys the built Worker. It uses Node 22.16.0. A build or migration failure stops
deployment. Production deploys are serialized without cancelling a running
deployment. Check **Actions → Deploy production** for the result.

Configure these repository **Actions secrets** before merging the workflow:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token scoped to the production account with Workers Scripts Write, Workers R2 Storage Write, D1 Write, and Account Settings Read permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Existing production Cloudflare account ID |
| `CLOUDFLARE_WRANGLER_CONFIG` | Complete production Wrangler configuration as valid JSON (remove JSONC comments and trailing commas), including existing D1/R2 bindings and `vars` |

The workflow replaces the template config with this private production config and
passes its `vars` to the build, including `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
`NEXT_PUBLIC_BASE_URL`. Config string values are masked in job logs. Keep
`CLERK_SECRET_KEY` as a Worker secret; do not include it in the config or GitHub
build environment. Existing Worker secrets are preserved by deployment.

Commit generated SQL migrations under `drizzle/`; CI applies only migrations not
recorded in D1's migration history. Keep pre-deploy migrations compatible with the
currently running code (for example, add nullable columns). Remove or rename used
columns only in a later migration after deploying code that no longer depends on
them. A Worker rollback does not undo database migrations. For a database created
outside migrations, verify its schema and establish a baseline migration history
before enabling this workflow; do not blindly mark migrations as applied.

When changing production bindings or variables, update `CLOUDFLARE_WRANGLER_CONFIG`
as well. This workflow does not create environments or run E2E tests against
production. See [Cloudflare's CI authentication guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

## Environment Variables

See `.env.example` for all available environment variables. For production, configure these in `wrangler.jsonc` under the `vars` section.

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

1. Delete `app/todos/` directory
2. Delete `app/actions/todos.ts`
3. Delete `lib/schemas/todo.ts`
4. Update `lib/db/schema.ts` to remove the todos table
5. Create new migration: `npx drizzle-kit generate`
6. Update navigation in `app/components/navigation.tsx`

### Adding New Features

1. Define database schema in `lib/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Create validation schema in `lib/schemas/`
4. Implement Server Actions in `app/actions/`
5. Build UI in `app/` using the example patterns

## Troubleshooting

### Database Issues
- **"Table not found"**: Run `pnpm run db:migrate:local` or `pnpm run db:migrate:prod`
- **"Database binding not found"**: Check `wrangler.jsonc` configuration

### Authentication Issues
- **"Clerk not configured"**: Verify `.env.local` has correct keys
- **"Unauthorized"**: Ensure you're signed in and have proper permissions

### Deployment Issues
- **Build fails**: Run `pnpm run type-check` to find TypeScript errors
- **Workers error**: Verify all IDs in `wrangler.jsonc` are correct
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
