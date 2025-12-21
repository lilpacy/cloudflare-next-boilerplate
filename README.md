# Cloudflare Next.js + D1 + R2 Boilerplate

A production-ready boilerplate for building full-stack applications with Next.js 15 on Cloudflare Workers, featuring D1 (SQLite) database, R2 object storage, and Clerk authentication.

## Features

- **Next.js 15** - Latest React framework with App Router and Server Components
- **Cloudflare Workers** - Deploy globally on the edge with Workers
- **D1 Database** - Serverless SQLite database at the edge
- **R2 Storage** - Object storage compatible with S3 API
- **Clerk Auth** - Drop-in authentication and user management
- **Drizzle ORM** - Type-safe database queries and migrations
- **TypeScript** - Full type safety across the stack
- **Tailwind CSS** - Utility-first CSS framework
- **Todo App Example** - Full CRUD implementation as reference

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Clerk account (free tier works)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cf-next-workers-d1-r2-boilerplate
npm install
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
npm run db:create

# Preview/staging database
npm run db:create:preview
```

Copy the database IDs from the output and update `wrangler.jsonc`:
- Replace `YOUR_D1_DATABASE_ID_HERE` with production database ID
- Replace `YOUR_PREVIEW_D1_DATABASE_ID_HERE` with preview database ID

#### R2 Buckets

```bash
# Create all required buckets
npm run storage:create        # Main storage
npm run storage:create:cache  # Next.js cache
npm run storage:create:preview # Preview storage
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
npm run db:migrate:local

# For production (after first deploy)
npm run db:migrate:remote
```

### 6. Start Development Server

```bash
npm run dev
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
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database (D1)
- `npm run db:create` - Create production database
- `npm run db:create:preview` - Create preview database
- `npm run db:migrate:local` - Run migrations locally
- `npm run db:migrate:remote` - Run migrations on production
- `npm run db:shell:local` - Open local database shell
- `npm run db:shell:remote` - Open remote database shell

### Storage (R2)
- `npm run storage:create` - Create main R2 bucket
- `npm run storage:create:cache` - Create cache bucket
- `npm run storage:create:preview` - Create preview bucket

### Deployment
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run preview` - Build and preview before deploying

## Deployment

### First-Time Deployment

1. Ensure all Cloudflare resources are created (D1, R2)
2. Update `wrangler.jsonc` with actual IDs and values
3. Run migrations locally first: `npm run db:migrate:local`
4. Deploy: `npm run deploy`
5. Run remote migrations: `npm run db:migrate:remote`

### Subsequent Deployments

```bash
npm run deploy
```

## Environment Variables

See `.env.example` for all available environment variables. For production, configure these in `wrangler.jsonc` under the `vars` section.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
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
- **"Table not found"**: Run `npm run db:migrate:local` or `npm run db:migrate:remote`
- **"Database binding not found"**: Check `wrangler.jsonc` configuration

### Authentication Issues
- **"Clerk not configured"**: Verify `.env.local` has correct keys
- **"Unauthorized"**: Ensure you're signed in and have proper permissions

### Deployment Issues
- **Build fails**: Run `npm run type-check` to find TypeScript errors
- **Workers error**: Verify all IDs in `wrangler.jsonc` are correct
- **Database migrations**: Ensure you ran `npm run db:migrate:remote` after deployment

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
