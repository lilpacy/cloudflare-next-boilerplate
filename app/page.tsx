// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description: "Next.js + Cloudflare Workers + D1 + R2 Boilerplate",
  openGraph: {
    title: "Cloudflare Next.js Boilerplate",
    description: "Production-ready boilerplate for Next.js on Cloudflare Workers",
    type: "website",
  },
};

const features = [
  {
    title: "Next.js 15",
    description: "Latest React framework with App Router and Server Components",
  },
  {
    title: "Cloudflare Workers",
    description: "Deploy globally with edge computing",
  },
  {
    title: "D1 Database",
    description: "Serverless SQL database at the edge",
  },
  {
    title: "R2 Storage",
    description: "Object storage without egress fees",
  },
  {
    title: "Clerk Auth",
    description: "Drop-in authentication and user management",
  },
  {
    title: "Drizzle ORM",
    description: "Type-safe database queries with migrations",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cloudflare Next.js Boilerplate
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Production-ready template for Next.js on Cloudflare Workers with D1 and R2
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/todos"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Demo App
            </Link>
            <a
              href="https://github.com/lilpacy/cloudflare-next-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Getting Started
          </h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Clone the repository and install dependencies</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Configure environment variables and Cloudflare settings</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Run migrations and start developing</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Deploy to Cloudflare Workers with a single command</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
