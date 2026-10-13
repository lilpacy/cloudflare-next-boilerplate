import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Takes the D1 binding as a parameter so that any Worker (the Next.js app, a cron
// Worker, a script) can open the same database without depending on OpenNext.
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
