// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Every component exported from index.ts must have a sibling <Name>.stories.tsx,
// otherwise `storybook:test` (render + a11y in Chromium) never sees it.
const srcDir = dirname(fileURLToPath(import.meta.url));

function exportedModules(): string[] {
  const source = readFileSync(join(srcDir, "index.ts"), "utf8");
  return [...source.matchAll(/from\s+"\.\/([^"]+)"/g)].map(([, name]) => name);
}

describe("packages/ui の story カバレッジ", () => {
  it("正常系: index.ts で公開している全コンポーネントに同じ場所の stories ファイルがある", () => {
    const modules = exportedModules();
    expect(modules.length).toBeGreaterThan(0);

    const missing = modules.filter((name) => !existsSync(join(srcDir, `${name}.stories.tsx`)));
    expect(
      missing,
      `packages/ui/src/${missing.join(", ")} に stories がありません。` +
        `同じ場所に <Name>.stories.tsx を作ってください（例: packages/ui/src/PrimaryButton.stories.tsx）。`
    ).toEqual([]);
  });
});
