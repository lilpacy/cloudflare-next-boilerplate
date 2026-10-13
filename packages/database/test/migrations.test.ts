// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";
import * as schema from "../src/schema";

const migrationsDir = join(import.meta.dirname, "../migrations");

type ColumnShape = { type: string; notNull: boolean; primaryKey: boolean };
type TableShapes = Record<string, Record<string, ColumnShape>>;

function applyMigrations(): Database.Database {
  const sqlite = new Database(":memory:");
  const journal = JSON.parse(readFileSync(join(migrationsDir, "meta/_journal.json"), "utf8")) as {
    entries: { tag: string }[];
  };
  for (const { tag } of journal.entries) {
    sqlite.exec(readFileSync(join(migrationsDir, `${tag}.sql`), "utf8"));
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
          { type: column.getSQLType(), notNull: column.notNull, primaryKey: column.primary },
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
      }[];
      return [
        name,
        Object.fromEntries(
          columns.map((column) => [
            column.name,
            { type: column.type.toLowerCase(), notNull: column.notnull === 1, primaryKey: column.pk > 0 },
          ])
        ),
      ];
    })
  );
}

describe("migrations と schema の整合", () => {
  it("正常系: migrations を順に適用した DB のテーブルと列が schema の定義と一致する", () => {
    const sqlite = applyMigrations();
    try {
      expect(shapesFromDatabase(sqlite)).toEqual(shapesFromSchema());
    } finally {
      sqlite.close();
    }
  });
});
