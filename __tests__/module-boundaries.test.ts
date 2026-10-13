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

describe("アプリ内の層の依存境界", () => {
  it.each([
    ["Domain", "app/_domain/boundary-check.ts", 'export type { Todo } from "./todo";'],
    ["Application", "app/_application/boundary-check.ts", 'export { findTodosByUser } from "@/app/_infrastructure/todos";'],
    ["Infrastructure", "app/_infrastructure/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
  ])("正常系: %s は下位の層と許可されたパッケージを利用できる", async (_, filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath });
    expect(result.messages.filter((m) => m.ruleId === "no-restricted-imports")).toEqual([]);
  });

  it.each([
    ["Domain から Infrastructure", "app/_domain/boundary-check.ts", 'export { getDb } from "@/app/_infrastructure/db";'],
    ["Domain から相対パスの Application", "app/_domain/boundary-check.ts", 'export { listTodos } from "../_application/todos";'],
    ["Domain から ORM", "app/_domain/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["Domain から Next.js", "app/_domain/boundary-check.ts", 'export { redirect } from "next/navigation";'],
    ["Application から ORM", "app/_application/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["Application から Clerk", "app/_application/boundary-check.ts", 'export { auth } from "@clerk/nextjs/server";'],
    ["Application から Cloudflare バインディング", "app/_application/boundary-check.ts", 'export { getCloudflareContext } from "@opennextjs/cloudflare";'],
    ["Application から Next.js のキャッシュ操作", "app/_application/boundary-check.ts", 'export { revalidatePath } from "next/cache";'],
    ["Infrastructure から Application", "app/_infrastructure/boundary-check.ts", 'export { listTodos } from "@/app/_application/todos";'],
    ["Infrastructure から Next.js", "app/_infrastructure/boundary-check.ts", 'export { redirect } from "next/navigation";'],
  ])("異常系: %s への依存は拒否される", async (_, filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath });
    expect(result.messages).toContainEqual(
      expect.objectContaining({ ruleId: "no-restricted-imports", severity: 2 })
    );
  });
});
