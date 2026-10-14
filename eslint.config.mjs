import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import nxPlugin from "@nx/eslint-plugin";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.open-next/**",
      "**/out/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.nx/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["e2e/fixtures/**/*.ts"],
    // Playwright's use callback is a lifecycle boundary, not React.use.
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  // Layer boundaries (ARCHITECTURE.md "Dependency rule"). `**/x` and `**/x/**` match both
  // `@/x/...` aliases and relative paths such as `../x/...`.
  {
    files: ["apps/web/src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/application", "**/application/**", "**/infrastructure", "**/infrastructure/**"],
              message: "Domain depends on nothing: no Application or Infrastructure imports.",
            },
            {
              group: ["react", "react-dom", "next", "next/**", "drizzle-orm", "drizzle-orm/**", "@cf-next/database", "@clerk/**", "@opennextjs/**"],
              message: "Domain holds pure types, schemas and rules: no framework, SDK or database imports.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["drizzle-orm", "drizzle-orm/**", "@cf-next/database", "@clerk/**", "@opennextjs/**"],
              message: "Application orchestrates Infrastructure; SDK and database access belong in apps/web/src/infrastructure.",
            },
            {
              group: ["react", "react-dom", "next", "next/**"],
              message: "Application knows nothing about Next.js or React; revalidatePath/redirect belong in the UI layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/application", "**/application/**"],
              message: "Infrastructure must not depend on Application.",
            },
            {
              group: ["react-dom", "next", "next/**"],
              message: "Infrastructure has no Next.js or React rendering concerns.",
            },
          ],
        },
      ],
    },
  },
  {
    // apps/web/src/middleware.ts is UI too, but stays out: it imports @clerk/nextjs/server for clerkMiddleware.
    files: ["apps/web/src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure", "**/infrastructure/**"],
              message: "UI reaches data only through apps/web/src/application use cases.",
            },
            {
              group: ["drizzle-orm", "drizzle-orm/**", "@cf-next/database", "@clerk/nextjs/server", "@opennextjs/**"],
              message: "SDK and database access belong in apps/web/src/infrastructure; UI calls apps/web/src/application.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "@nx": nxPlugin },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          // Preserve existing intra-app @/ imports; cross-project cycles remain forbidden.
          allowCircularSelfDependency: true,
          banTransitiveDependencies: true,
          depConstraints: [
            { sourceTag: "type:app", onlyDependOnLibsWithTags: ["type:ui", "type:database"] },
            {
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:ui"],
              bannedExternalImports: [
                "@clerk/*",
                "drizzle-orm",
                "drizzle-orm/*",
                "@aws-sdk/*",
                "@opennextjs/*",
              ],
            },
            {
              // Table definitions and migrations only: no app, UI or framework dependencies,
              // so a cron Worker or a script can use the package without Next.js.
              sourceTag: "type:database",
              onlyDependOnLibsWithTags: [],
              bannedExternalImports: ["@clerk/*", "@opennextjs/*", "@aws-sdk/*", "next", "next/*", "react", "react-dom", "server-only"],
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
