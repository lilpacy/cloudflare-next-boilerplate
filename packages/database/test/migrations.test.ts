// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  type DrizzleSQLiteSnapshotJSON,
  generateSQLiteDrizzleJson,
  generateSQLiteMigration,
} from "drizzle-kit/api";
import { describe, expect, it } from "vitest";
import * as schema from "../src/schema";

const migrationsDir = join(import.meta.dirname, "../migrations");

type ColumnShape = { type: string; notNull: boolean; primaryKey: boolean; hasDefault: boolean };
type TableShapes = Record<string, Record<string, ColumnShape>>;

function latestSnapshot(): DrizzleSQLiteSnapshotJSON {
  const metaDir = join(migrationsDir, "meta");
  const [latest] = readdirSync(metaDir)
    .filter((name) => name.endsWith("_snapshot.json"))
    .sort()
    .reverse();
  return JSON.parse(readFileSync(join(metaDir, latest), "utf8")) as DrizzleSQLiteSnapshotJSON;
}

// Same selection as `wrangler d1 migrations apply`: every *.sql directly in migrations_dir, by name.
function applyMigrations(): Database.Database {
  const sqlite = new Database(":memory:");
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const file of files) {
    sqlite.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
  return sqlite;
}

function shapesFromSchema(): TableShapes {
  const tables = (Object.values(schema) as unknown[]).filter((value): value is SQLiteTable =>
    is(value, SQLiteTable)
  );
  return Object.fromEntries(
    tables.map((table) => [
      getTableName(table),
      Object.fromEntries(
        Object.values(getTableColumns(table)).map((column) => [
          column.name,
          {
            type: column.getSQLType(),
            notNull: column.notNull,
            primaryKey: column.primary,
            hasDefault: column.hasDefault,
          },
        ])
      ),
    ])
  );
}

function shapesFromDatabase(sqlite: Database.Database): TableShapes {
  const tables = sqlite
    .prepare("select name from sqlite_master where type = 'table' and name not like 'sqlite_%'")
    .all() as { name: string }[];
  return Object.fromEntries(
    tables.map(({ name }) => {
      const columns = sqlite.prepare(`pragma table_info(${JSON.stringify(name)})`).all() as {
        name: string;
        type: string;
        notnull: number;
        pk: number;
        dflt_value: string | null;
      }[];
      return [
        name,
        Object.fromEntries(
          columns.map((column) => [
            column.name,
            {
              type: column.type.toLowerCase(),
              notNull: column.notnull === 1,
              primaryKey: column.pk > 0,
              hasDefault: column.dflt_value !== null,
            },
          ])
        ),
      ];
    })
  );
}

describe("migrations と schema の整合", () => {
  it("正常系: schema は最後に生成した migration の snapshot から変わっていない", async () => {
    const current = await generateSQLiteDrizzleJson(schema);
    const pending = await generateSQLiteMigration(latestSnapshot(), current);

    expect(pending).toEqual([]);
  });

  it("正常系: migrations の SQL をすべて適用した DB のテーブルと列が schema の定義と一致する", () => {
    const sqlite = applyMigrations();
    try {
      expect(shapesFromDatabase(sqlite)).toEqual(shapesFromSchema());
    } finally {
      sqlite.close();
    }
  });
});
