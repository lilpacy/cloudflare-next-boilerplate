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
    expect(Object.keys(graph.nodes).sort()).toEqual(["database", "ui", "web"]);
    expect(graph.dependencies.web).toContainEqual(expect.objectContaining({ target: "ui" }));
    expect(graph.dependencies.web).toContainEqual(expect.objectContaining({ target: "database" }));

    const [result] = await new ESLint().lintText('export { Card } from "@cf-next/ui";', {
      filePath: "apps/web/src/app/components/boundary-check.ts",
    });
    expect(result.errorCount).toBe(0);
  });

  it.each([
    ["エイリアス", 'export { default as Footer } from "@/app/components/footer";'],
    ["相対パス", 'export { default as Footer } from "../../../apps/web/src/app/components/footer";'],
    ["アプリのパッケージ名", 'export * from "cf-next-workers-d1-r2-boilerplate";'],
    ["動的 import", 'export const loadFooter = () => import("../../../apps/web/src/app/components/footer");'],
    ["require", 'export const loadFooter = () => require("../../../apps/web/src/app/components/footer");'],
    ["認証", 'export * from "@clerk/nextjs";'],
    ["データベース", 'export * from "drizzle-orm";'],
    ["データベースパッケージ", 'export * from "@cf-next/database";'],
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

describe("データベースパッケージの依存境界", () => {
  it("正常系: テーブル定義は drizzle だけに依存できる", async () => {
    const [result] = await new ESLint().lintText('export { sqliteTable } from "drizzle-orm/sqlite-core";', {
      filePath: "packages/database/src/boundary-check.ts",
    });
    expect(result.errorCount).toBe(0);
  });

  it.each([
    ["アプリ", 'export type { Todo } from "@/domain/todo";'],
    ["共有 UI", 'export { Card } from "@cf-next/ui";'],
    ["Next.js", 'export { cache } from "react";'],
    ["OpenNext バインディング", 'export { getCloudflareContext } from "@opennextjs/cloudflare";'],
  ])("異常系: %s への依存は拒否される", async (_, code) => {
    const [result] = await new ESLint().lintText(code, {
      filePath: "packages/database/src/boundary-check.ts",
    });
    expect(result.messages).toContainEqual(
      expect.objectContaining({ ruleId: "@nx/enforce-module-boundaries", severity: 2 })
    );
  });
});

describe("アプリ内の層の依存境界", () => {
  it.each([
    ["Domain", "apps/web/src/domain/boundary-check.ts", 'export type { Todo } from "./todo";'],
    ["Application", "apps/web/src/application/boundary-check.ts", 'export { findTodosByUser } from "@/infrastructure/todos";'],
    ["Infrastructure", "apps/web/src/infrastructure/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["Infrastructure からテーブル定義", "apps/web/src/infrastructure/boundary-check.ts", 'export { todos } from "@cf-next/database";'],
    ["UI のサーバーファイル", "apps/web/src/app/todos/boundary-check.ts", 'export { listTodos } from "@/application/todos";'],
    ["UI の Client Component", "apps/web/src/app/todos/components/boundary-check.ts", 'export { useUser } from "@clerk/nextjs";'],
  ])("正常系: %s は下位の層と許可されたパッケージを利用できる", async (_, filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath });
    expect(result.messages.filter((m) => m.ruleId === "no-restricted-imports")).toEqual([]);
  });

  it.each([
    ["Domain から Infrastructure", "apps/web/src/domain/boundary-check.ts", 'export { getDb } from "@/infrastructure/db";'],
    ["Domain から相対パスの Application", "apps/web/src/domain/boundary-check.ts", 'export { listTodos } from "../application/todos";'],
    ["Domain から ORM", "apps/web/src/domain/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["Domain から Next.js", "apps/web/src/domain/boundary-check.ts", 'export { redirect } from "next/navigation";'],
    ["Domain からテーブル定義", "apps/web/src/domain/boundary-check.ts", 'export { todos } from "@cf-next/database";'],
    ["Application から ORM", "apps/web/src/application/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["Application から Clerk", "apps/web/src/application/boundary-check.ts", 'export { auth } from "@clerk/nextjs/server";'],
    ["Application から Cloudflare バインディング", "apps/web/src/application/boundary-check.ts", 'export { getCloudflareContext } from "@opennextjs/cloudflare";'],
    ["Application から Next.js のキャッシュ操作", "apps/web/src/application/boundary-check.ts", 'export { revalidatePath } from "next/cache";'],
    ["Application からテーブル定義", "apps/web/src/application/boundary-check.ts", 'export { todos } from "@cf-next/database";'],
    ["Infrastructure から Application", "apps/web/src/infrastructure/boundary-check.ts", 'export { listTodos } from "@/application/todos";'],
    ["Infrastructure から Next.js", "apps/web/src/infrastructure/boundary-check.ts", 'export { redirect } from "next/navigation";'],
    ["UI から Infrastructure", "apps/web/src/app/todos/boundary-check.ts", 'export { getDb } from "@/infrastructure/db";'],
    ["UI から相対パスの Infrastructure", "apps/web/src/app/api/images/boundary-check.ts", 'export { getObject } from "../../../infrastructure/storage";'],
    ["UI から ORM", "apps/web/src/app/todos/boundary-check.ts", 'export { eq } from "drizzle-orm";'],
    ["UI からテーブル定義", "apps/web/src/app/todos/boundary-check.ts", 'export { todos } from "@cf-next/database";'],
    ["UI から Clerk のサーバー SDK", "apps/web/src/app/admin/boundary-check.ts", 'export { auth } from "@clerk/nextjs/server";'],
    ["UI から Cloudflare バインディング", "apps/web/src/app/api/images/boundary-check.ts", 'export { getCloudflareContext } from "@opennextjs/cloudflare";'],
  ])("異常系: %s への依存は拒否される", async (_, filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath });
    expect(result.messages).toContainEqual(
      expect.objectContaining({ ruleId: "no-restricted-imports", severity: 2 })
    );
  });
});
