// @vitest-environment node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  execFileSync("pnpm", ["exec", "nx", "graph", "--file=.nx/boundary-test-graph.json"], {
    env: { ...process.env, NX_DAEMON: "false" },
    stdio: "pipe",
  });
});

describe("共有 UI の依存境界", () => {
  it("正常系: アプリと UI が別プロジェクトになり、アプリから UI を利用できる", async () => {
    const { graph } = JSON.parse(readFileSync(".nx/boundary-test-graph.json", "utf8"));
    expect(Object.keys(graph.nodes).sort()).toEqual(["ui", "web"]);
    expect(graph.dependencies.web).toContainEqual(expect.objectContaining({ target: "ui" }));

    const [result] = await new ESLint().lintText('export { Card } from "@cf-next/ui";', {
      filePath: "app/components/boundary-check.ts",
    });
    expect(result.errorCount).toBe(0);
  });

  it.each([
    ["エイリアス", 'export { default as Footer } from "@/app/components/footer";'],
    ["相対パス", 'export { default as Footer } from "../../../app/components/footer";'],
    ["アプリのパッケージ名", 'export * from "cf-next-workers-d1-r2-boilerplate";'],
    ["動的 import", 'export const loadFooter = () => import("../../../app/components/footer");'],
    ["require", 'export const loadFooter = () => require("../../../app/components/footer");'],
    ["認証", 'export * from "@clerk/nextjs";'],
    ["データベース", 'export * from "drizzle-orm";'],
    ["ストレージ SDK", 'export * from "@aws-sdk/client-s3";'],
    ["Cloudflare バインディング", 'export * from "@opennextjs/cloudflare";'],
  ])("異常系: %s でも UI からアプリ固有の機能へ依存すると拒否される", async (kind, code) => {
    const [result] = await new ESLint().lintText(code, {
      filePath: "packages/ui/src/boundary-check.ts",
    });
    expect(result.messages).toContainEqual(
      expect.objectContaining({
        ruleId: "@nx/enforce-module-boundaries",
        severity: 2,
        ...(kind === "エイリアス" ? { messageId: "noCircularDependencies" } : {}),
      })
    );
  });
});
