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
  // Layer boundaries (ARCHITECTURE.md "Dependency rule"). `**/_x` and `**/_x/**` match both
  // `@/app/_x/...` aliases and relative paths such as `../_x/...`.
  {
    files: ["app/_domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/_application", "**/_application/**", "**/_infrastructure", "**/_infrastructure/**"],
              message: "Domain depends on nothing: no Application or Infrastructure imports.",
            },
            {
              group: ["react", "react-dom", "next", "next/**", "drizzle-orm", "drizzle-orm/**", "@clerk/**", "@opennextjs/**"],
              message: "Domain holds pure types, schemas and rules: no framework or SDK imports.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/_application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["drizzle-orm", "drizzle-orm/**", "@clerk/**", "@opennextjs/**"],
              message: "Application orchestrates Infrastructure; SDK access belongs in app/_infrastructure.",
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
    files: ["app/_infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/_application", "**/_application/**"],
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
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/_domain/**", "app/_application/**", "app/_infrastructure/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/_infrastructure", "**/_infrastructure/**"],
              message: "UI reaches data only through app/_application use cases.",
            },
            {
              group: ["drizzle-orm", "drizzle-orm/**", "@clerk/nextjs/server", "@opennextjs/**"],
              message: "SDK access belongs in app/_infrastructure; UI calls app/_application.",
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
            { sourceTag: "type:app", onlyDependOnLibsWithTags: ["type:ui"] },
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
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
