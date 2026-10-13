import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infrastructure/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
});
