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
