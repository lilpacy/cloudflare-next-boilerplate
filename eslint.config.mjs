import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.open-next/**",
      "**/out/**",
      "**/dist/**",
      "**/.turbo/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
